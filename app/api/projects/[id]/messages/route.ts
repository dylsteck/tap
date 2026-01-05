import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/(auth)/auth'

export const dynamic = 'force-dynamic';
import { 
  getProjectById,
  getProjectChatMessages,
  saveProjectChatMessage 
} from '@/lib/db/queries'

// GET - Get project chat messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const project = await getProjectById({ id })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const messages = await getProjectChatMessages({ projectId: id })
    
    // Transform to client format
    const formattedMessages = messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.createdAt,
      metadata: m.metadata,
    }))

    return NextResponse.json({ messages: formattedMessages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST - Add a new message
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
    const { role, content, metadata } = body

    const project = await getProjectById({ id })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const message = await saveProjectChatMessage({
      projectId: id,
      role,
      content,
      metadata,
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error saving message:', error)
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }
}

