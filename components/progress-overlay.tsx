'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ProgressOverlayProps {
  isVisible: boolean
  steps: {
    id: string
    label: string
    status: 'pending' | 'active' | 'completed' | 'failed'
  }[]
  currentStep?: string
  onClose?: () => void
}

// Icons
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
)

export function ProgressOverlay({ isVisible, steps, currentStep, onClose }: ProgressOverlayProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  
  const completedSteps = steps.filter(s => s.status === 'completed').length
  const totalSteps = steps.length
  const progress = (completedSteps / totalSteps) * 100

  useEffect(() => {
    // Animate progress
    const timer = setTimeout(() => {
      setAnimatedProgress(progress)
    }, 100)
    return () => clearTimeout(timer)
  }, [progress])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[360px] mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 mb-4">
            <SparklesIcon />
          </div>
          <h2 className="text-xl font-bold text-white">Building your app</h2>
          <p className="text-sm text-zinc-500 mt-1">This usually takes less than a minute</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${animatedProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-zinc-500">
            <span>{Math.round(animatedProgress)}%</span>
            <span>{completedSteps} of {totalSteps} steps</span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                step.status === 'active' && "bg-zinc-800/80",
                step.status === 'completed' && "opacity-60",
                step.status === 'pending' && "opacity-40"
              )}
            >
              {/* Status Icon */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                step.status === 'pending' && "bg-zinc-800 text-zinc-600",
                step.status === 'active' && "bg-violet-500/20 text-violet-400",
                step.status === 'completed' && "bg-emerald-500/20 text-emerald-400",
                step.status === 'failed' && "bg-red-500/20 text-red-400"
              )}>
                {step.status === 'pending' && (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
                {step.status === 'active' && (
                  <div className="w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                )}
                {step.status === 'completed' && <CheckIcon />}
                {step.status === 'failed' && <XIcon />}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  step.status === 'active' && "text-white",
                  step.status === 'completed' && "text-zinc-400",
                  step.status === 'pending' && "text-zinc-500",
                  step.status === 'failed' && "text-red-400"
                )}>
                  {step.label}
                </p>
              </div>

              {/* Status Badge */}
              {step.status === 'active' && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400 px-2 py-0.5 rounded-full bg-violet-500/10">
                  In Progress
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Cancel Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-xl border border-zinc-800 text-zinc-400 text-sm font-medium hover:bg-zinc-900 hover:text-white hover:border-zinc-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

type StepStatus = 'pending' | 'active' | 'completed' | 'failed'

interface Step {
  id: string
  label: string
  status: StepStatus
}

// Helper hook for managing progress steps
export function useProgressSteps(initialSteps: string[]) {
  const [steps, setSteps] = useState<Step[]>(
    initialSteps.map((label, i) => ({
      id: `step-${i}`,
      label,
      status: 'pending',
    }))
  )

  const startStep = (index: number) => {
    setSteps(prev => prev.map((step, i) => ({
      ...step,
      status: (i === index ? 'active' : i < index ? 'completed' : 'pending') as StepStatus,
    })))
  }

  const completeStep = (index: number) => {
    setSteps(prev => prev.map((step, i) => ({
      ...step,
      status: (i === index ? 'completed' : step.status) as StepStatus,
    })))
  }

  const failStep = (index: number) => {
    setSteps(prev => prev.map((step, i) => ({
      ...step,
      status: (i === index ? 'failed' : step.status) as StepStatus,
    })))
  }

  const reset = () => {
    setSteps(initialSteps.map((label, i) => ({
      id: `step-${i}`,
      label,
      status: 'pending' as StepStatus,
    })))
  }

  return { steps, startStep, completeStep, failStep, reset }
}

