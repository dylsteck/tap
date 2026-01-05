export const MINIAPP_SYSTEM_PROMPT = `You are an expert Farcaster miniapp builder. You create production-ready, mobile-first mini applications that run inside the Farcaster ecosystem on Base chain.

## Your Role
You help users build Farcaster miniapps (also called "frames") by generating complete, working code based on their descriptions. You should be creative, suggest improvements, and ensure the code is optimized for the mobile-first Farcaster experience.

## Technical Stack
- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS with a dark-mode-first aesthetic
- **Chain**: Base (Coinbase L2)
- **APIs Available**: Neynar (Farcaster), Zora (NFTs), Zapper (DeFi), CoinGecko (Prices), Alchemy (Blockchain)

## Design Requirements
1. **Mobile-First**: All UIs must be optimized for 430px width mobile viewports
2. **Dark Theme**: Use dark backgrounds (#000, #0A0A0A, zinc-900) with high contrast text
3. **Touch Targets**: Minimum 44px for interactive elements
4. **Typography**: Bold, readable fonts - avoid small text
5. **Animations**: Subtle, performant micro-interactions
6. **Safe Areas**: Account for mobile safe areas (notch, home indicator)

## Code Output Format
When generating code, output valid JSX/TSX that can be directly rendered. Use this structure:

\`\`\`tsx
// Component code here
export default function MiniApp() {
  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Content */}
    </div>
  )
}
\`\`\`

## Farcaster-Specific Features
- Support for Farcaster frame actions (button clicks, redirects)
- Integration with user's FID (Farcaster ID)
- Cast sharing functionality
- Channel integration
- Wallet connection via EIP-1193 (injected provider)

## API Integration Patterns

### Neynar (Farcaster API)
\`\`\`tsx
// Fetch user by FID
const response = await fetch(\`/api/neynar/user/\${fid}\`)

// Fetch casts from channel
const casts = await fetch(\`/api/neynar/feed/\${channel}\`)
\`\`\`

### Zora (NFT Minting)
\`\`\`tsx
// Create mint button
<button onClick={() => mint(collectionAddress, tokenId)}>
  Mint NFT
</button>
\`\`\`

### Zapper (DeFi Data)
\`\`\`tsx
// Get portfolio value
const portfolio = await fetch(\`/api/zapper/portfolio/\${address}\`)
\`\`\`

## Style Guidelines
1. Use rounded corners liberally (rounded-xl, rounded-2xl)
2. Subtle borders (border-zinc-800)
3. Glass effects with backdrop-blur where appropriate
4. Gradient accents (violet-to-fuchsia for primary actions)
5. High contrast text (text-white, text-zinc-400 for secondary)

## Response Format
When responding to a user's request:
1. First, briefly acknowledge their idea and any clarifying points
2. Then provide the complete code solution
3. Explain any key design decisions
4. Suggest potential enhancements if relevant

Remember: Keep responses focused on the actual implementation. Users want working code, not long explanations.`

export const CODE_TEMPLATE_BASE = `'use client'

import { useState, useEffect } from 'react'

export default function MiniApp() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[430px] mx-auto px-4 py-6 pb-safe">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-xl font-bold">App Name</h1>
        </header>

        {/* Main Content */}
        <main className="space-y-4">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <p className="text-zinc-400">Your content here</p>
          </div>
        </main>
      </div>
    </div>
  )
}`

export const MINIAPP_TEMPLATES: Record<string, { name: string; description: string; code: string }> = {
  'nft-mint': {
    name: 'NFT Minting Frame',
    description: 'A frame that allows users to mint NFTs from a collection',
    code: `'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'

export default function NFTMintFrame() {
  const { address, isConnected } = useAccount()
  const [quantity, setQuantity] = useState(1)
  
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const mintPrice = 0.001 // ETH
  const maxPerWallet = 5

  const handleMint = () => {
    writeContract({
      address: '0x...', // Collection address
      abi: [], // Collection ABI
      functionName: 'mint',
      args: [BigInt(quantity)],
      value: parseEther((mintPrice * quantity).toString()),
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[430px] mx-auto px-4 py-6">
        {/* NFT Preview */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 mb-6">
          <img 
            src="/nft-preview.png" 
            alt="NFT Preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-xl font-bold">Collection Name</h1>
            <p className="text-zinc-400 text-sm">by Artist Name</p>
          </div>
        </div>

        {/* Mint Controls */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Price</span>
            <span className="font-bold">{mintPrice} ETH</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Quantity</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700"
              >
                -
              </button>
              <span className="w-8 text-center font-bold">{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(maxPerWallet, quantity + 1))}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-zinc-800">
            <span>Total</span>
            <span>{(mintPrice * quantity).toFixed(3)} ETH</span>
          </div>

          {isConnected ? (
            <button
              onClick={handleMint}
              disabled={isPending || isConfirming}
              className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 disabled:opacity-50 transition-all"
            >
              {isPending ? 'Confirming...' : isConfirming ? 'Minting...' : isSuccess ? 'Minted!' : 'Mint Now'}
            </button>
          ) : (
            <button className="w-full py-4 rounded-xl bg-white text-black font-bold">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  )
}`
  },
  'leaderboard': {
    name: 'Leaderboard Frame',
    description: 'A leaderboard showing top users with rankings',
    code: `'use client'

import { useState, useEffect } from 'react'

interface User {
  rank: number
  fid: number
  username: string
  pfp: string
  score: number
}

export default function LeaderboardFrame() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'all'>('week')

  useEffect(() => {
    // Fetch leaderboard data
    fetchLeaderboard()
  }, [timeframe])

  const fetchLeaderboard = async () => {
    setIsLoading(true)
    // TODO: Fetch from your API
    const mockData: User[] = [
      { rank: 1, fid: 1, username: 'user1', pfp: '', score: 1250 },
      { rank: 2, fid: 2, username: 'user2', pfp: '', score: 980 },
      { rank: 3, fid: 3, username: 'user3', pfp: '', score: 750 },
    ]
    setUsers(mockData)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[430px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Top performers this {timeframe}</p>
        </div>

        {/* Timeframe Tabs */}
        <div className="flex bg-zinc-900 rounded-xl p-1 mb-6">
          {(['day', 'week', 'all'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={\`flex-1 py-2 rounded-lg text-sm font-medium transition-all \${
                timeframe === t ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }\`}
            >
              {t === 'day' ? 'Today' : t === 'week' ? 'This Week' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="space-y-2">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-zinc-900 animate-pulse" />
            ))
          ) : (
            users.map((user) => (
              <div
                key={user.fid}
                className={\`flex items-center gap-4 p-4 rounded-xl transition-all \${
                  user.rank <= 3 ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-900/50'
                }\`}
              >
                <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm \${
                  user.rank === 1 ? 'bg-yellow-500 text-black' :
                  user.rank === 2 ? 'bg-zinc-400 text-black' :
                  user.rank === 3 ? 'bg-amber-700 text-white' :
                  'bg-zinc-800 text-zinc-400'
                }\`}>
                  {user.rank}
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                  {user.pfp && <img src={user.pfp} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">@{user.username}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{user.score.toLocaleString()}</p>
                  <p className="text-xs text-zinc-500">points</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}`
  },
  'poll': {
    name: 'Voting Poll Frame',
    description: 'A poll/voting frame with multiple options',
    code: `'use client'

import { useState } from 'react'

interface Option {
  id: string
  text: string
  votes: number
}

export default function PollFrame() {
  const [options, setOptions] = useState<Option[]>([
    { id: '1', text: 'Option A', votes: 42 },
    { id: '2', text: 'Option B', votes: 38 },
    { id: '3', text: 'Option C', votes: 20 },
  ])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)

  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0)

  const handleVote = (optionId: string) => {
    if (hasVoted) return
    
    setSelectedId(optionId)
    setOptions(prev => prev.map(o => 
      o.id === optionId ? { ...o, votes: o.votes + 1 } : o
    ))
    setHasVoted(true)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[430px] mx-auto px-4 py-6">
        {/* Question */}
        <div className="mb-6">
          <h1 className="text-xl font-bold">What's your favorite?</h1>
          <p className="text-zinc-500 text-sm mt-1">{totalVotes} votes • Ends in 2 days</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option) => {
            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
            const isSelected = selectedId === option.id
            
            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={hasVoted}
                className={\`w-full relative overflow-hidden rounded-xl border transition-all \${
                  isSelected 
                    ? 'border-white bg-white/5' 
                    : 'border-zinc-800 hover:border-zinc-700'
                }\`}
              >
                {/* Progress Bar */}
                <div 
                  className={\`absolute inset-y-0 left-0 transition-all duration-500 \${
                    isSelected ? 'bg-white/20' : 'bg-zinc-800/50'
                  }\`}
                  style={{ width: hasVoted ? \`\${percentage}%\` : '0%' }}
                />
                
                {/* Content */}
                <div className="relative flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={\`w-5 h-5 rounded-full border-2 flex items-center justify-center \${
                      isSelected ? 'border-white bg-white' : 'border-zinc-600'
                    }\`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                    <span className="font-medium">{option.text}</span>
                  </div>
                  {hasVoted && (
                    <span className="font-bold">{percentage}%</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Share Button */}
        {hasVoted && (
          <button className="w-full mt-6 py-3 rounded-xl border border-zinc-800 text-zinc-400 font-medium hover:bg-zinc-900 transition-colors">
            Share Poll
          </button>
        )}
      </div>
    </div>
  )
}`
  },
}

