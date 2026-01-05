import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/(auth)/auth'

export const dynamic = 'force-dynamic';
import { 
  createProject, 
  getProjectsByUserId,
  saveProjectChatMessage 
} from '@/lib/db/queries'

// GET - List user's projects
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await getProjectsByUserId({ userId: session.user.id })
    
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

// POST - Create a new project
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, apis = [] } = body

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Create the project
    const project = await createProject({
      userId: session.user.id,
      name: prompt.substring(0, 50),
      description: prompt,
    })

    // Save the initial chat message
    await saveProjectChatMessage({
      projectId: project.id,
      role: 'user',
      content: prompt,
      metadata: { apis },
    })

    return NextResponse.json({ 
      projectId: project.id,
      subdomain: project.subdomain,
      project 
    })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

