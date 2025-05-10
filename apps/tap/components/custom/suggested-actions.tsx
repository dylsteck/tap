'use client'

import { Button } from '@workspace/ui/components/button'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import React from 'react'


const actions = [
  'Show me some upcoming events',
  'What Clanker tokens are trending?',
  'Look up AI discussions',
  'What casts are trending right now?',
  'Show me casts from the fc-devs channel',
  'Find open bounties this week',
  'Who is @v?',
  'What are the latest casts from dwr.eth?',
  'How do I build a bot with Neynar?'
]

export function SuggestedActions({ onActionSelect }: { onActionSelect: (action: string) => void }) {
  return (
    <div className="w-full overflow-x-hidden relative">
      <motion.div
        className="flex flex-row gap-2 items-center justify-start 2xl:justify-center px-4 py-1 space-x-1.5"
        animate={{
          x: ['0%', '-100%'],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        {[...actions, ...actions].map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => onActionSelect(item)}
              variant="outline"
              size="sm"
              className="border-foreground/40 rounded-xl text-xs px-3 py-2 h-auto whitespace-nowrap bg-gray-200 dark:bg-[#141414] backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
            >
              <div className="rounded-full bg-gray-800 dark:bg-gray-200 p-1">
                <TrendingUp className="size-4 text-white dark:text-gray-600" />
              </div>
              {item}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}