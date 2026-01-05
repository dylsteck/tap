import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/(auth)/auth'

export const dynamic = 'force-dynamic';
import { 
  getProjectById,
  getLatestProjectCode,
  updateProject
} from '@/lib/db/queries'
import { handleDeployRequest } from '@/lib/services/cloudflare'

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
    const project = await getProjectById({ id })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get the latest code
    const codeRecord = await getLatestProjectCode({ projectId: id })
    
    if (!codeRecord) {
      return NextResponse.json({ error: 'No code to deploy' }, { status: 400 })
    }

    // Update status to building
    await updateProject({ id, status: 'building' })

    // Generate subdomain if not exists
    const subdomain = project.subdomain || generateSubdomain(project.name)

    // Get the main code file
    const files = codeRecord.files as Record<string, string>
    const mainCode = files['page.tsx'] || files['index.tsx'] || Object.values(files)[0]

    if (!mainCode) {
      await updateProject({ id, status: 'failed' })
      return NextResponse.json({ error: 'No valid code found' }, { status: 400 })
    }

    // Deploy to Cloudflare
    const result = await handleDeployRequest(
      id,
      subdomain,
      mainCode,
      project.name
    )

    if (result.status === 'failed') {
      await updateProject({ id, status: 'failed' })
      return NextResponse.json({ 
        error: result.error || 'Deployment failed' 
      }, { status: 500 })
    }

    // Update project with deployment info
    await updateProject({ 
      id, 
      status: 'deployed',
      deploymentUrl: result.url,
      subdomain: subdomain,
    })

    return NextResponse.json({
      success: true,
      url: result.url,
      subdomain: result.subdomain,
      deploymentId: result.deploymentId,
    })
  } catch (error) {
    console.error('Deploy error:', error)
    
    // Update status to failed
    try {
      const { id } = await params
      await updateProject({ id, status: 'failed' })
    } catch {
      // Ignore
    }

    return NextResponse.json({ error: 'Deployment failed' }, { status: 500 })
  }
}

function generateSubdomain(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join('-')
    .substring(0, 20)
  
  const suffix = Math.random().toString(36).substring(2, 8)
  return `${base}-${suffix}`
}

