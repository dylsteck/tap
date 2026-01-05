'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAuthModal } from '@/components/auth-modal-provider'
import { BottomNav } from '@/components/bottom-nav'
import { cn } from '@/lib/utils'

// Icons
const SettingsIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const WalletIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </svg>
)

const LogOutIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
)

const TrashIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
)

const EditIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
)

const HeartIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
)

interface Project {
  id: string
  name: string
  subdomain: string
  status: 'draft' | 'building' | 'deployed' | 'failed'
  deploymentUrl: string | null
  likesCount: number
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const { openAuthModal } = useAuthModal()
  const router = useRouter()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'apps' | 'liked'>('apps')

  useEffect(() => {
    if (status === 'unauthenticated') {
      openAuthModal()
      return
    }

    if (session?.user) {
      fetchProjects()
    }
  }, [session, status, openAuthModal])

  const fetchProjects = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white">
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center">
              <WalletIcon size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Sign in to view your profile</h2>
              <p className="text-zinc-500 text-sm">Create and manage your Farcaster miniapps</p>
            </div>
            <button
              onClick={openAuthModal}
              className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-colors"
            >
              Sign In
            </button>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 px-6 pt-6 pb-4 bg-black/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-[430px] mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-white font-black text-lg tracking-tight">Profile</h1>
            <button 
              onClick={() => router.push('/settings')}
              className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20 pb-32">
        <div className="max-w-[430px] mx-auto px-4">
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl font-bold">
                {session.user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">
                <EditIcon size={14} />
              </button>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-lg font-bold">{session.user?.email?.split('@')[0] || 'User'}</h2>
              <p className="text-sm text-zinc-500">{session.user?.email}</p>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="text-center">
                <p className="text-xl font-bold">{projects.length}</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Apps</p>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div className="text-center">
                <p className="text-xl font-bold">
                  {projects.reduce((sum, p) => sum + p.likesCount, 0)}
                </p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Likes</p>
              </div>
            </div>
          </div>

          <div className="flex border-b border-zinc-800 mb-4">
            <button
              onClick={() => setActiveTab('apps')}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors relative",
                activeTab === 'apps' ? "text-white" : "text-zinc-500"
              )}
            >
              My Apps
              {activeTab === 'apps' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors relative",
                activeTab === 'liked' ? "text-white" : "text-zinc-500"
              )}
            >
              Liked
              {activeTab === 'liked' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
          </div>

          {activeTab === 'apps' && (
            <div className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 rounded-xl bg-zinc-900 animate-pulse" />
                  ))}
                </div>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onDelete={handleDeleteProject}
                  />
                ))
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-600">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="7" height="7" x="3" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="14" rx="1" />
                      <rect width="7" height="7" x="3" y="14" rx="1" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-zinc-400 font-medium">No apps yet</p>
                    <p className="text-zinc-600 text-sm">Create your first Farcaster miniapp!</p>
                  </div>
                  <button
                    onClick={() => router.push('/create')}
                    className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors"
                  >
                    Create App
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'liked' && (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-600">
                <HeartIcon size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-zinc-400 font-medium">No liked apps yet</p>
                <p className="text-zinc-600 text-sm">Apps you like will appear here</p>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-zinc-800">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <LogOutIcon size={18} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

function ProjectCard({ project, onDelete }: { project: Project; onDelete: (id: string) => void }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  
  const statusColors = {
    draft: 'bg-zinc-700',
    building: 'bg-amber-500 animate-pulse',
    deployed: 'bg-emerald-500',
    failed: 'bg-red-500',
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this project?')) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        onDelete(project.id)
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="relative group">
      <button
        onClick={() => router.push(`/studio/${project.id}`)}
        className="w-full flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900 transition-all text-left group"
      >
        <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0">
          <span className="text-lg">🚀</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">{project.name}</h3>
            <div className={cn("w-2 h-2 rounded-full shrink-0", statusColors[project.status])} />
          </div>
          <p className="text-xs text-zinc-500 truncate mt-0.5">
            {project.status === 'deployed' ? `${project.subdomain}.tap.computer` : 'Draft'}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
              <HeartIcon size={10} />
              {project.likesCount}
            </span>
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 rounded-lg text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
        >
          {isDeleting ? (
            <div className="w-4 h-4 rounded-full border-2 border-zinc-600 border-t-zinc-400 animate-spin" />
          ) : (
            <TrashIcon size={18} />
          )}
        </button>
      </button>
    </div>
  )
}
