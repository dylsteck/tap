'use client'

export const dynamic = 'force-dynamic';

import { useState, useRef, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAuthModal } from '@/components/auth-modal-provider'
import { BottomNav } from '@/components/bottom-nav'
import { cn } from '@/lib/utils'

// Icons
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

const APIIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M2 15h10" />
    <path d="m9 18 3-3-3-3" />
  </svg>
)

const SettingsIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const SendIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
)

const suggestions = [
  { emoji: '🎯', text: 'NFT minting page', api: 'Zora' },
  { emoji: '📊', text: 'Token tracker', api: 'CoinGecko' },
  { emoji: '🏆', text: 'Leaderboard', api: 'Neynar' },
  { emoji: '🗳️', text: 'Voting frame', api: 'Farcaster' },
  { emoji: '💸', text: 'Tip button', api: 'Base' },
  { emoji: '🎨', text: 'Gallery viewer', api: 'Zora' },
]

const IdeasIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
)

const MusicIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
)

const MagicIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
)

const ArrowUpIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </svg>
)

const LayersIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m2.6 11.23 8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9" />
    <path d="m2.6 15.3 8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9" />
  </svg>
)

const CloseIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

export default function CreatePage() {
  const { data: session } = useSession()
  const { openAuthModal } = useAuthModal()
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const [input, setInput] = useState('')
  const [selectedAPIs, setSelectedAPIs] = useState<string[]>(['Neynar'])
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'ideas' | 'images' | 'sounds' | 'make'>('ideas')
  const [showAPIs, setShowAPIs] = useState(false)

  const availableAPIs = [
    { name: 'Neynar', emoji: '🟣', description: 'Farcaster API' },
    { name: 'Zora', emoji: '🎨', description: 'NFT Protocol' },
    { name: 'Zapper', emoji: '⚡', description: 'DeFi Data' },
    { name: 'CoinGecko', emoji: '🦎', description: 'Token Prices' },
    { name: 'Alchemy', emoji: '🔮', description: 'Blockchain Data' },
  ]

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`
    }
  }

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    setInput(suggestion.text)
    if (!selectedAPIs.includes(suggestion.api)) {
      setSelectedAPIs([...selectedAPIs, suggestion.api])
    }
    textareaRef.current?.focus()
  }

  const toggleAPI = (apiName: string) => {
    setSelectedAPIs(prev => 
      prev.includes(apiName) 
        ? prev.filter(a => a !== apiName)
        : [...prev, apiName]
    )
  }

  const handleSubmit = useCallback(async () => {
    if (!session) {
      openAuthModal()
      return
    }

    if (!input.trim()) return

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          apis: selectedAPIs,
        }),
      })

      if (response.ok) {
        const { projectId } = await response.json()
        router.push(`/studio/${projectId}`)
      }
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [input, selectedAPIs, session, openAuthModal, router])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 pb-2">
        <div className="max-w-[430px] mx-auto">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <CloseIcon size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-10 px-3 overflow-y-auto">
        <div className="max-w-[460px] mx-auto flex flex-col gap-3">
          
          {/* Section 1: Top Input Box */}
          <div className="rounded-[32px] bg-zinc-900/90 border border-zinc-800 focus-within:border-zinc-700 focus-within:bg-zinc-900 transition-all p-5 shadow-2xl">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe an idea..."
              className="w-full bg-transparent px-2 pt-2 pb-16 text-white placeholder:text-zinc-600 resize-none focus:outline-none text-3xl font-bold tracking-tight leading-tight min-h-[200px]"
              rows={1}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-colors shadow-sm">
                  <LayersIcon size={20} />
                </button>
                {input && (
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-2 animate-in fade-in slide-in-from-left-2">
                    Nice momentum
                  </span>
                )}
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isGenerating}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  input.trim() && !isGenerating
                    ? "bg-white text-black hover:bg-zinc-200 active:scale-90"
                    : "bg-zinc-800 text-zinc-600"
                )}
              >
                {isGenerating ? (
                  <div className="w-4 h-4 rounded-full border-2 border-zinc-600 border-t-zinc-400 animate-spin" />
                ) : (
                  <ArrowUpIcon size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Section 2: Bottom Shelf Box */}
          <div className="rounded-[32px] bg-zinc-900/40 border border-zinc-800/50 p-6 shadow-xl flex-1">
            {/* Tab Bar inside Section 2 */}
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-zinc-800/30 pb-px mb-6">
              {[
                { id: 'ideas', label: 'Ideas', icon: IdeasIcon },
                { id: 'images', label: 'Images', icon: ImageIcon },
                { id: 'sounds', label: 'Sounds', icon: MusicIcon },
                { id: 'make', label: 'Make Image', icon: MagicIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 py-3 text-xs font-bold transition-all border-b-2 -mb-px shrink-0 uppercase tracking-wider",
                    activeTab === tab.id 
                      ? "text-white border-white" 
                      : "text-zinc-500 border-transparent hover:text-zinc-400"
                  )}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Shelf Content inside Section 2 */}
            <div className="min-h-[240px] animate-in fade-in slide-in-from-bottom-2 duration-300">
              {activeTab === 'ideas' && (
                <div className="grid grid-cols-2 gap-3">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex flex-col p-4 rounded-2xl bg-zinc-800/30 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-800 transition-all text-left group"
                    >
                      <span className="text-2xl mb-3 group-hover:scale-110 transition-transform origin-left">{suggestion.emoji}</span>
                      <p className="text-[14px] font-bold text-white leading-tight">{suggestion.text}</p>
                      <p className="text-[9px] text-zinc-600 uppercase tracking-widest mt-1.5 font-bold">{suggestion.api}</p>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'images' && (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-zinc-800/50 flex items-center justify-center text-zinc-500 border border-zinc-800">
                    <ImageIcon size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">Enable Photos Access</h3>
                    <p className="text-zinc-500 text-xs max-w-[200px] mx-auto leading-relaxed">
                      Add photos to your Tap or use screenshots to reproduce a specific style
                    </p>
                  </div>
                  <button className="px-12 py-3.5 rounded-full bg-white text-black font-bold text-sm hover:bg-zinc-100 active:scale-95 transition-all">
                    Enable
                  </button>
                </div>
              )}

              {activeTab === 'sounds' && (
                <div className="space-y-8 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-800/30 border border-zinc-800/50 hover:bg-zinc-800 transition-all gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m16 8-8 8"/><path d="m8 8 8 8"/></svg>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Video</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-800/30 border border-zinc-800/50 hover:bg-zinc-800 transition-all gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Files</span>
                    </button>
                  </div>
                  <div className="flex flex-col items-center gap-6">
                    <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.2em]">Or Record Audio</p>
                    <button className="w-14 h-14 rounded-full border-[3px] border-zinc-800 p-1.5 group">
                      <div className="w-full h-full rounded-full bg-rose-500 group-active:scale-90 transition-all" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'make' && (
                <div className="flex flex-col items-center justify-center py-14 text-center space-y-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-800 animate-pulse">
                    <MagicIcon size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-zinc-500 tracking-tight">Nothing to make!</h3>
                    <p className="text-zinc-600 text-xs max-w-[200px] mx-auto leading-relaxed font-bold uppercase tracking-wide">
                      Start typing your ideas above
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* API Selector Tooltip (Optional/Floating) */}
      {showAPIs && (
        <div className="fixed inset-x-4 bottom-24 z-[60] animate-in slide-in-from-bottom-4">
          <div className="max-w-[400px] mx-auto rounded-3xl bg-zinc-900 border border-zinc-800 p-4 shadow-2xl">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3 px-1">Integrations</p>
            <div className="flex flex-wrap gap-2">
              {availableAPIs.map((api) => (
                <button
                  key={api.name}
                  onClick={() => toggleAPI(api.name)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                    selectedAPIs.includes(api.name)
                      ? "bg-white text-black"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  )}
                >
                  <span>{api.emoji}</span>
                  <span>{api.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] w-full max-w-[400px] px-4 animate-in slide-in-from-bottom-8">
          <div className="rounded-2xl bg-zinc-900/95 backdrop-blur border border-zinc-800 p-4 shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-sm font-bold text-white">Working on it...</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-500">2.4s</span>
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

