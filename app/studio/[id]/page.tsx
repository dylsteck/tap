'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthModal } from '@/components/auth-modal-provider'
import { cn } from '@/lib/utils'

// Icons
const ArrowLeftIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
)

const SparklesIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
)

const ImageIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
)

const LayersIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m2.6 11.23 8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9" />
    <path d="m2.6 15.3 8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9" />
  </svg>
)

const ArrowUpIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </svg>
)

const SettingsIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const TrashIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
)

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  code?: string
  status?: 'thinking' | 'coding' | 'done'
}

interface Project {
  id: string
  name: string
  subdomain: string
  status: 'draft' | 'building' | 'deployed' | 'failed'
  deploymentUrl: string | null
}

export default function StudioPage() {
  const { data: session, status } = useSession()
  const { openAuthModal } = useAuthModal()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [generatedCode, setGeneratedCode] = useState<string>('')
  const [showSettings, setShowSettings] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const triggerGeneration = useCallback(async (prompt: string) => {
    setIsGenerating(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          code: data.code,
          status: 'done'
        }
        setMessages(prev => [...prev, assistantMessage])
        if (data.code) {
          setGeneratedCode(data.code)
        }
      }
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [projectId])

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data.project)
        
        if (data.project?.status === 'building') {
          setIsGenerating(true)
        }
      } else if (response.status === 404) {
        router.push('/profile')
      }
    } catch (error) {
      console.error('Failed to fetch project:', error)
    } finally {
      setIsLoading(false)
    }
  }, [projectId, router])

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/messages`)
      if (response.ok) {
        const data = await response.json()
        const fetchedMessages = data.messages || []
        setMessages(fetchedMessages)
        
        const hasAssistant = fetchedMessages.some((m: Message) => m.role === 'assistant')
        const hasUser = fetchedMessages.some((m: Message) => m.role === 'user')
        
        if (hasUser && !hasAssistant && !isGenerating) {
          const initialPrompt = fetchedMessages.find((m: Message) => m.role === 'user')?.content
          if (initialPrompt) {
            triggerGeneration(initialPrompt)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }, [projectId, isGenerating, triggerGeneration])

  const fetchCode = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.project?.latestCode) {
          setGeneratedCode(data.project.latestCode)
        }
      }
    } catch (error) {
      console.error('Failed to fetch code:', error)
    }
  }, [projectId])

  useEffect(() => {
    if (status === 'unauthenticated') {
      openAuthModal()
      return
    }

    if (session?.user && projectId) {
      fetchProject()
      fetchMessages()
      fetchCode()
    }
  }, [session, status, projectId, openAuthModal, fetchProject, fetchMessages, fetchCode])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  const handleSubmit = async () => {
    if (!input.trim() || isGenerating) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    triggerGeneration(input)
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleDeploy = async () => {
    if (!project) return
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'building' }),
      })
      setProject(prev => prev ? { ...prev, status: 'building' } : null)
    } catch (error) {
      console.error('Deploy failed:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        router.push('/profile')
      }
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center">
        <p className="text-zinc-500">Project not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      <header className="shrink-0 px-4 pt-6 pb-4 bg-black/90 backdrop-blur-xl z-50">
        <div className="max-w-[430px] mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeftIcon size={20} />
          </button>
          
          <div className="flex-1 text-center px-4">
            <h1 className="text-sm font-bold truncate">{project?.name}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showSettings ? "text-white bg-zinc-800" : "text-zinc-500 hover:text-white"
              )}
            >
              <SettingsIcon size={20} />
            </button>

            <button
              onClick={handleDeploy}
              disabled={project?.status === 'building'}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                project?.status === 'deployed' 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-white text-black hover:bg-zinc-200"
              )}
            >
              {project?.status === 'deployed' ? 'Live' : project?.status === 'building' ? 'Building...' : 'Deploy'}
            </button>
          </div>
        </div>

        {/* Settings Dropdown */}
        {showSettings && (
          <div className="max-w-[430px] mx-auto pt-2 animate-in slide-in-from-top-2 duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-xl">
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-sm font-bold"
              >
                <TrashIcon size={18} />
                Delete Project
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-hidden px-4">
        <div className="max-w-[430px] mx-auto h-full flex flex-col gap-4">
          <div className="flex-1 rounded-[32px] bg-zinc-900 border border-zinc-800 overflow-hidden relative shadow-2xl">
            {isGenerating && !generatedCode ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10 gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-white/5" />
                  <div className="absolute top-0 w-12 h-12 rounded-full border-2 border-t-white border-transparent animate-spin" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Generating</span>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">Claude is building...</span>
                </div>
              </div>
            ) : null}

            {activeTab === 'preview' ? (
              generatedCode ? (
                <iframe
                  srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:system-ui,sans-serif;background:#18181b;color:white}</style></head><body>${generatedCode}</body></html>`}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700">
                  <SparklesIcon size={40} />
                </div>
              )
            ) : (
              <div className="h-full overflow-auto p-6 font-mono text-[10px] text-zinc-400">
                <pre>{generatedCode || '// Code will appear here'}</pre>
              </div>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md rounded-full p-1 border border-white/10 flex gap-1">
              <button
                onClick={() => setActiveTab('preview')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold transition-all",
                  activeTab === 'preview' ? "bg-white text-black" : "text-white/60 hover:text-white"
                )}
              >
                Preview
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold transition-all",
                  activeTab === 'code' ? "bg-white text-black" : "text-white/60 hover:text-white"
                )}
              >
                Code
              </button>
            </div>
          </div>

          <div className="shrink-0 pb-10 space-y-4">
            {messages.filter(m => m.role === 'assistant').length > 0 && (
              <div className="px-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-zinc-900/50 backdrop-blur p-3 rounded-2xl border border-zinc-800/50">
                  <p className="text-xs text-zinc-400 leading-relaxed italic">
                    {messages.filter(m => m.role === 'assistant').slice(-1)[0].content}
                  </p>
                </div>
              </div>
            )}

            <div className="relative group">
              <div className="rounded-[32px] bg-zinc-900 border border-zinc-800 focus-within:border-zinc-700 focus-within:bg-zinc-900 transition-all p-3 shadow-xl">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe a change..."
                  className="w-full bg-transparent px-3 pt-2 pb-10 text-white placeholder:text-zinc-600 resize-none focus:outline-none text-sm leading-relaxed min-h-[56px] max-h-[160px]"
                  rows={1}
                />
                
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <button className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                    <LayersIcon size={16} />
                  </button>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={!input.trim() || isGenerating}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                      input.trim() && !isGenerating
                        ? "bg-white text-black hover:bg-zinc-200 active:scale-90"
                        : "bg-zinc-800 text-zinc-600"
                    )}
                  >
                    {isGenerating ? (
                      <div className="w-[18px] h-[18px] rounded-full border-2 border-zinc-600 border-t-zinc-400 animate-spin" />
                    ) : (
                      <ArrowUpIcon size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] w-full max-w-[400px] px-4 animate-in slide-in-from-bottom-8">
          <div className="rounded-2xl bg-zinc-900/95 backdrop-blur border border-zinc-800 p-4 shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-sm font-bold text-white tracking-tight">Working on it...</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-500">4.4s</span>
              <button onClick={() => setIsGenerating(false)} className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                <div className="w-2 h-2 rounded-sm bg-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
