/* eslint-disable @next/next/no-img-element */
"use client"

import { useVirtualizer } from "@tanstack/react-virtual"
import { motion } from "framer-motion"
import Hls from "hls.js"
import { DollarSign, MoreVertical, Volume2, VolumeX, ExternalLink, Maximize2, Play, Pause, Share2 } from "lucide-react"
import { memo, useState, useEffect, useRef, useMemo, useCallback } from "react"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { fetcher } from "@/lib/utils"

import FrameLink from "../../utils/frame-link"

interface Cast {
  hash: string
  author: {
    fid: string
    username: string
    pfp_url: string
  }
  embeds: Array<{
    metadata?: {
      content_type?: string
    }
    url: string
  }>
  reactions: any;
}

interface VideoPlayerProps {
  cast: Cast
  isMuted: boolean
  toggleMute: (hash: string) => void
  handleExpand: (hash: string) => void
}

const VideoPlayer = memo(({ cast, isMuted, toggleMute, handleExpand }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showControl, setShowControl] = useState(false)
  const controlTimeoutRef = useRef<NodeJS.Timeout>()
  const videoEmbed = cast.embeds?.find((embed) => 
    embed.metadata?.content_type?.startsWith("video/") || embed.url.endsWith(".m3u8")
  )

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(() => {})
      }
      setIsPlaying(!isPlaying)
      setShowControl(true)
      
      if (controlTimeoutRef.current) {
        clearTimeout(controlTimeoutRef.current)
      }
      controlTimeoutRef.current = setTimeout(() => {
        setShowControl(false)
      }, 1000)
    }
  }, [isPlaying])

  useEffect(() => {
    if (!videoRef.current || !videoEmbed) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setIsVisible(entry.isIntersecting)
        
        if (entry.isIntersecting) {
          const video = videoRef.current
          if (video) {
            const videoUrl = videoEmbed.url
            if (Hls.isSupported() && videoUrl.includes(".m3u8")) {
              const hls = new Hls()
              hls.loadSource(videoUrl)
              hls.attachMedia(video)
            } else {
              video.src = videoUrl
            }
            video.load()
            video.play().catch(() => {})
            setIsPlaying(true)
          }
        } else {
          if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
            videoRef.current.load()
            setIsPlaying(false)
          }
        }
      },
      { threshold: 0.8 }
    )

    observer.observe(videoRef.current)
    return () => observer.disconnect()
  }, [videoEmbed])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isVisible) {
        video.play().catch(() => {})
        setIsPlaying(true)
      }
    }

    video.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => video.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [isVisible])

  useEffect(() => {
    return () => {
      if (controlTimeoutRef.current) {
        clearTimeout(controlTimeoutRef.current)
      }
    }
  }, [])

  if (!videoEmbed) return null

  return (
    <div className="relative w-full max-w-[360px] aspect-[9/16] bg-black rounded-2xl overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover cursor-pointer"
        loop
        playsInline
        muted={isMuted}
        autoPlay={isVisible}
        onClick={togglePlayPause}
      />
      {showControl && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 rounded-full p-4 transition-opacity">
          {isPlaying ? (
            <Pause className="size-8 text-white" />
          ) : (
            <Play className="size-8 text-white" />
          )}
        </div>
      )}
      <div className="absolute right-4 bottom-8 flex flex-col items-center gap-4 z-10">
        <div className="size-10 rounded-full overflow-hidden bg-black/40 ring-2 ring-white">
          <FrameLink type="profile" identifier={cast.author.fid}>
            <img
              src={cast.author?.pfp_url || "/placeholder.svg"}
              alt={`@${cast.author.username}'s PFP`}
              className="size-full object-cover cursor-pointer"
            />
          </FrameLink>
        </div>
      </div>
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-black/40 hover:bg-black/75 transition-colors"
          onClick={() => toggleMute(cast.hash)}
        >
          {isMuted ? <VolumeX className="size-6 text-white" /> : <Volume2 className="size-6 text-white" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/40 hover:bg-black/75 transition-colors"
            >
              <MoreVertical className="size-6 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-black/80 p-1 w-24 space-y-1">
            <FrameLink type="url" identifier={`https://warpcast.com/${cast.author.username}/${cast.hash}`}>
              <DropdownMenuItem className="cursor-pointer">
                <ExternalLink className="mr-2 size-4" />
                View Cast
              </DropdownMenuItem>
            </FrameLink>
            <FrameLink type="url" identifier={`https://warpcast.com/~/compose?text=I%20just%20found%20this%20video%20on%20%40tapit!&embeds[]=https://warpcast.com/${cast.author.username}/${cast.hash.slice(0, 10)}`}>
              <DropdownMenuItem className="cursor-pointer">
                <Share2 className="mr-2 size-4" />
                Share
              </DropdownMenuItem>
            </FrameLink>
            <DropdownMenuItem className="cursor-pointer" onClick={() => handleExpand(cast.hash)}>
              <Maximize2 className="mr-2 size-4" />
              Expand
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
})

VideoPlayer.displayName = "VideoPlayer"

interface VirtualItem {
  index: number
  start: number
}

export default function CastVideos() {
  const { data: feed, error: isError, isLoading } = useSWR<{ casts: Cast[] }>("/api/farcaster/cast/videos", fetcher)
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredCasts = useMemo(() => {
    if (!feed?.casts) return []
    const filtered = feed.casts.filter((cast) => 
      cast.embeds?.some((embed) => 
        embed.metadata?.content_type?.startsWith("video/") || embed.url.endsWith(".m3u8")
      )
    ).map(cast => ({
      ...cast,
      reactions: {
        ...cast.reactions,
        likes_count: cast.reactions?.likes_count || 0
      }
    }))
    return filtered.sort((a, b) => (b.reactions?.likes_count || 0) - (a.reactions?.likes_count || 0))
  }, [feed])

  const rowVirtualizer = useVirtualizer({
    count: filteredCasts.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => window.innerHeight,
    overscan: 2
  })

  useEffect(() => {
    if (!filteredCasts.length) return
    const newMutedStates: Record<string, boolean> = {}
    filteredCasts.forEach((cast) => {
      newMutedStates[cast.hash] = false
    })
    setMutedStates(newMutedStates)
  }, [filteredCasts])

  const toggleMute = useCallback((hash: string) => {
    setMutedStates(prev => {
      const newStates = { ...prev }
      Object.keys(newStates).forEach(key => {
        newStates[key] = key === hash ? !prev[key] : true
      })
      return newStates
    })
  }, [])

  const handleExpand = useCallback((hash: string) => {
    const videoElement = document.querySelector(`[data-hash="${hash}"] video`) as HTMLVideoElement
    if (videoElement) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen()
      } else if ((videoElement as any).webkitEnterFullscreen) {
        (videoElement as any).webkitEnterFullscreen()
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Skeleton className="w-full max-w-[360px] aspect-[9/16]" />
      </div>
    )
  }

  if (isError) {
    return <div className="flex justify-center items-center h-screen">Error loading feed. Please try again later.</div>
  }

  if (!feed) return null

  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-transparent">
      <div className="relative w-full max-w-[360px] h-screen">
        <div ref={containerRef} className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none">
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative"
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
              const cast = filteredCasts[virtualRow.index]
              return (
                <div
                  key={cast.hash}
                  data-hash={cast.hash}
                  data-index={virtualRow.index}
                  className="video-container absolute top-0 left-0 w-full flex items-center justify-center h-screen snap-start snap-always"
                  style={{
                    transform: `translateY(${virtualRow.start}px)`
                  }}
                >
                  <VideoPlayer
                    cast={cast}
                    isMuted={mutedStates[cast.hash]}
                    toggleMute={toggleMute}
                    handleExpand={handleExpand}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}