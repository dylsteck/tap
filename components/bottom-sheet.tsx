'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  snapPoints?: number[] // percentages, e.g. [25, 50, 90]
  defaultSnapPoint?: number
}

export function BottomSheet({ 
  isOpen, 
  onClose, 
  children, 
  title,
  snapPoints = [50, 90],
  defaultSnapPoint = 50
}: BottomSheetProps) {
  const [currentHeight, setCurrentHeight] = useState(defaultSnapPoint)
  const [isDragging, setIsDragging] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const startHeight = useRef(0)

  useEffect(() => {
    if (isOpen) {
      setCurrentHeight(defaultSnapPoint)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, defaultSnapPoint])

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    startY.current = e.touches[0].clientY
    startHeight.current = currentHeight
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    
    const deltaY = startY.current - e.touches[0].clientY
    const windowHeight = window.innerHeight
    const deltaPercent = (deltaY / windowHeight) * 100
    const newHeight = Math.max(10, Math.min(95, startHeight.current + deltaPercent))
    
    setCurrentHeight(newHeight)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    
    // Snap to nearest point or close
    if (currentHeight < 15) {
      onClose()
      return
    }

    const closest = snapPoints.reduce((prev, curr) =>
      Math.abs(curr - currentHeight) < Math.abs(prev - currentHeight) ? curr : prev
    )
    setCurrentHeight(closest)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 rounded-t-3xl shadow-xl",
          "animate-in slide-in-from-bottom duration-300",
          isDragging ? "" : "transition-all duration-300 ease-out"
        )}
        style={{ height: `${currentHeight}vh` }}
      >
        {/* Handle */}
        <div 
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-5 pb-3 border-b border-zinc-800">
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
        )}

        {/* Content */}
        <div className="h-full overflow-y-auto pb-safe overscroll-contain">
          <div className="px-5 py-4">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

// Simple action sheet variant
interface ActionSheetProps {
  isOpen: boolean
  onClose: () => void
  actions: {
    label: string
    icon?: ReactNode
    onClick: () => void
    variant?: 'default' | 'destructive'
  }[]
  title?: string
}

export function ActionSheet({ isOpen, onClose, actions, title }: ActionSheetProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe animate-in slide-in-from-bottom duration-300">
        <div className="bg-zinc-900 rounded-2xl overflow-hidden">
          {/* Title */}
          {title && (
            <div className="px-4 py-3 text-center border-b border-zinc-800">
              <p className="text-sm text-zinc-400">{title}</p>
            </div>
          )}

          {/* Actions */}
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => {
                action.onClick()
                onClose()
              }}
              className={cn(
                "w-full flex items-center justify-center gap-3 px-4 py-4 text-base font-medium",
                "border-b border-zinc-800 last:border-b-0",
                "active:bg-zinc-800 transition-colors",
                action.variant === 'destructive' 
                  ? "text-red-500" 
                  : "text-white"
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>

        {/* Cancel button */}
        <button
          onClick={onClose}
          className="w-full mt-2 py-4 bg-zinc-900 rounded-2xl text-base font-semibold text-white active:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </>
  )
}

