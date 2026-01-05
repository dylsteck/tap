'use client'

import { cn } from '@/lib/utils'

interface Suggestion {
  emoji: string
  text: string
  category?: string
  api?: string
}

interface SuggestionGridProps {
  suggestions: Suggestion[]
  onSelect: (suggestion: Suggestion) => void
  columns?: 2 | 3
  variant?: 'default' | 'compact'
}

export function SuggestionGrid({ 
  suggestions, 
  onSelect, 
  columns = 2,
  variant = 'default'
}: SuggestionGridProps) {
  return (
    <div className={cn(
      "grid gap-2",
      columns === 2 ? "grid-cols-2" : "grid-cols-3"
    )}>
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onSelect(suggestion)}
          className={cn(
            "flex items-center gap-2.5 rounded-xl border border-zinc-800/50 text-left group transition-all",
            "hover:border-zinc-700 hover:bg-zinc-900 active:scale-[0.98]",
            variant === 'default' 
              ? "p-3 bg-zinc-900/50"
              : "p-2 bg-zinc-900/30"
          )}
        >
          <span className={cn(
            "transition-transform group-hover:scale-110",
            variant === 'default' ? "text-xl" : "text-lg"
          )}>
            {suggestion.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className={cn(
              "font-medium text-white truncate",
              variant === 'default' ? "text-sm" : "text-xs"
            )}>
              {suggestion.text}
            </p>
            {(suggestion.api || suggestion.category) && variant === 'default' && (
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider truncate">
                {suggestion.api || suggestion.category}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

// Preset suggestions for miniapp ideas
export const miniappSuggestions = [
  { emoji: '🎯', text: 'NFT minting page', api: 'Zora' },
  { emoji: '📊', text: 'Token price tracker', api: 'CoinGecko' },
  { emoji: '🏆', text: 'Leaderboard frame', api: 'Neynar' },
  { emoji: '🗳️', text: 'Voting/poll frame', api: 'Farcaster' },
  { emoji: '💸', text: 'Tip/payment button', api: 'Base' },
  { emoji: '🎨', text: 'NFT gallery viewer', api: 'Zora' },
  { emoji: '📰', text: 'Cast feed widget', api: 'Neynar' },
  { emoji: '🔔', text: 'Notification hub', api: 'Neynar' },
  { emoji: '👤', text: 'Profile card', api: 'Neynar' },
  { emoji: '💱', text: 'Token swap UI', api: 'Zapper' },
  { emoji: '📈', text: 'Portfolio tracker', api: 'Zapper' },
  { emoji: '🎁', text: 'Airdrop checker', api: 'Alchemy' },
]

// Quick actions for the studio
export const studioQuickActions = [
  { emoji: '🎨', text: 'Change colors' },
  { emoji: '📝', text: 'Edit text' },
  { emoji: '➕', text: 'Add section' },
  { emoji: '🔗', text: 'Add link' },
  { emoji: '📸', text: 'Add image' },
  { emoji: '🔄', text: 'Regenerate' },
]

