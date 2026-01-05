import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/(auth)/auth'

export const dynamic = 'force-dynamic';
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { 
  getProjectById,
  saveProjectChatMessage,
  saveProjectCode,
  updateProject
} from '@/lib/db/queries'
import { MINIAPP_SYSTEM_PROMPT, MINIAPP_TEMPLATES } from '@/lib/ai/miniapp-system-prompt'

// Default to Anthropic Claude, can be switched via env var
const getModel = () => {
  const provider = process.env.AI_PROVIDER || 'anthropic'
  const model = process.env.AI_MODEL || 'claude-sonnet-4-20250514'
  
  if (provider === 'anthropic') {
    return anthropic(model)
  }
  
  // Fallback to anthropic
  return anthropic('claude-sonnet-4-20250514')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { message, apis = [] } = body

    const project = await getProjectById({ id })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Save user message
    await saveProjectChatMessage({
      projectId: id,
      role: 'user',
      content: message,
      metadata: { apis },
    })

    // Update project status to building
    await updateProject({ id, status: 'building' })

    // Check if request matches a template
    const templateMatch = findMatchingTemplate(message)
    
    let generatedCode: string
    let responseMessage: string

    if (templateMatch) {
      // Use pre-built template
      generatedCode = templateMatch.code
      responseMessage = `I've created a ${templateMatch.name} for you! This template includes ${templateMatch.description}. You can customize it further by describing any changes you'd like.`
    } else {
      // Generate with AI (using Anthropic Claude)
      const apiContext = apis.length > 0 
        ? `\n\nAvailable APIs to use: ${apis.join(', ')}` 
        : ''

      const result = await generateText({
        model: getModel(),
        system: MINIAPP_SYSTEM_PROMPT + apiContext,
        prompt: `Create a Farcaster miniapp based on this description: ${message}

Return ONLY the complete React component code without any markdown code fences or explanations. The code should be production-ready.`,
        maxOutputTokens: 4000,
      })

      generatedCode = extractCodeFromResponse(result.text)
      responseMessage = "Here's your miniapp! I've created a mobile-first component based on your description. Let me know if you'd like any changes."
    }

    // Save assistant message
    await saveProjectChatMessage({
      projectId: id,
      role: 'assistant',
      content: responseMessage,
      metadata: { code: generatedCode },
    })

    // Save generated code version
    await saveProjectCode({
      projectId: id,
      files: { 'page.tsx': generatedCode },
      prompt: message,
    })

    // Update status back to draft (ready for editing)
    await updateProject({ id, status: 'draft' })

    return NextResponse.json({ 
      message: responseMessage,
      code: generatedCode,
    })
  } catch (error) {
    console.error('Error generating code:', error)
    
    // If we have a project ID, update status to failed
    try {
      const { id } = await params
      if (id) {
        await updateProject({ id, status: 'failed' })
      }
    } catch {
      // Ignore error handling errors
    }
    
    return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 })
  }
}

// Find matching template based on user message
function findMatchingTemplate(message: string): typeof MINIAPP_TEMPLATES[string] | null {
  const lower = message.toLowerCase()
  
  if (lower.includes('nft') && (lower.includes('mint') || lower.includes('minting'))) {
    return MINIAPP_TEMPLATES['nft-mint']
  }
  
  if (lower.includes('leaderboard') || lower.includes('ranking') || lower.includes('top users')) {
    return MINIAPP_TEMPLATES['leaderboard']
  }
  
  if (lower.includes('poll') || lower.includes('voting') || lower.includes('vote')) {
    return MINIAPP_TEMPLATES['poll']
  }
  
  return null
}

// Extract code from AI response (handles various formats)
function extractCodeFromResponse(response: string): string {
  // Remove markdown code fences if present
  let code = response
  
  // Check for ```tsx or ```jsx blocks
  const codeBlockMatch = response.match(/```(?:tsx|jsx|typescript|javascript)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    code = codeBlockMatch[1].trim()
  }
  
  // If no code block found, use the raw response
  // but try to clean up any leading/trailing non-code content
  if (!code.includes('export default') && !code.includes('function')) {
    // Response might not be valid code, return a fallback
    return `'use client'

export default function MiniApp() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-zinc-500">Unable to generate component. Please try again with a clearer description.</p>
    </div>
  )
}`
  }
  
  return code
}

