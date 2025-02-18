/* eslint-disable @next/next/no-img-element */
"use client"

import { useVirtualizer } from "@tanstack/react-virtual"
import { motion } from "framer-motion"
import Hls from "hls.js"
import { DollarSign, MoreVertical, Volume2, VolumeX, ExternalLink, Maximize2, Play, Pause, Share2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Session } from "next-auth"
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
import { cn, fetcher, USER_FALLBACK_IMG_URL } from "@/lib/utils"

import TipDrawer from "./tip"
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
  reactions: any
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
    <div className="relative w-full max-w-[360px] aspect-[9/16] rounded-2xl overflow-hidden">
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
        {(cast.author as any).verified_addresses?.eth_addresses && (cast.author as any).verified_addresses.eth_addresses.length > 0 ? 
          <TipDrawer recipientAddress={(cast.author as any).verified_addresses.eth_addresses[0]} recipientUsername={cast.author.username} recipientPfp={cast.author.pfp_url} />
        : null}
        <div className="size-10 rounded-full overflow-hidden bg-black/40 ring-2 ring-white">
          <FrameLink identifier={cast.author.fid} type="profile">
            <img
              src={cast.author?.pfp_url ?? USER_FALLBACK_IMG_URL}
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
            <FrameLink type="url" identifier={`https://warpcast.com/~/compose?text=I%20just%20found%20this%20video%20on%20%2Ftap!&embeds[]=https://warpcast.com/${cast.author.username}/${cast.hash.slice(0, 10)}`}>
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

export default function CastVideos({ session }: { session: Session | null }) {
  const [selectedTab, setSelectedTab] = useState<"trending" | "you">("trending")
  const [isMobile, setIsMobile] = useState(false)
  const feedUrl = useMemo(() => {
    if (selectedTab === "you" && session?.user) {
      return `/api/farcaster/cast/videos/${(session.user as any).fid}`
    }
    return "/api/farcaster/cast/videos"
  }, [selectedTab, session])
  const { data: feed, error: isError, isLoading } = useSWR<{ casts: Cast[] }>(feedUrl, fetcher)
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div>Error loading feed</div>
        <Button onClick={() => router.refresh()} className="mt-4">Refresh</Button>
      </div>
    )
  }

  if (!feed) return null

  return (
    <div className="flex justify-center items-center w-full min-h-screen">
      <div className="relative w-full max-w-[360px] h-screen">
        <div
          className="fixed z-20 w-auto max-w-[360px] pt-4"
          style={{
            top: 0,
            left: isMobile ? "55px" : "auto"
          }}
        >
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setSelectedTab("trending")}
              className={cn(
                "text-white font-normal px-2 py-1 rounded transition-colors cursor-pointer",
                selectedTab === "trending" ? "font-medium" : "opacity-70 hover:opacity-100"
              )}
            >
              Trending
            </button>
            <button
              onClick={() => setSelectedTab("you")}
              className={cn(
                "text-white font-normal px-2 py-1 rounded transition-colors cursor-pointer",
                selectedTab === "you" ? "font-medium" : "opacity-70 hover:opacity-100"
              )}
              disabled={!session}
            >
              You
            </button>
          </div>
        </div>
        <div ref={containerRef} className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none m-0 p-0">
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
                  className="video-container absolute top-0 left-0 w-full flex items-center justify-center h-screen snap-center snap-always"
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