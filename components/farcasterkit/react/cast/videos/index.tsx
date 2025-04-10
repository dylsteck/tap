/* eslint-disable import/no-named-as-default */
/* eslint-disable @next/next/no-img-element */
"use client"

import sdk from "@farcaster/frame-sdk"
import { useVirtualizer } from "@tanstack/react-virtual"
import { motion } from "framer-motion"
import Hls from "hls.js"
import { MoreVertical, Volume2, VolumeX, ExternalLink, Maximize2, Play, Pause, Share2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Session } from "next-auth"
import { memo, useState, useEffect, useRef, useMemo, useCallback } from "react"
import useSWR from "swr"

import { VideoHeader } from "@/components/custom/video-header"
import { NeynarCastV2 } from "@/components/farcasterkit/common/types/neynar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn, fetcher, USER_FALLBACK_IMG_URL } from "@/lib/utils"

import TipDrawer from "./tip"


interface VideoPlayerProps {
  cast: NeynarCastV2
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
  const handleViewProfile = async(fid: number) => {
    try{
      await sdk.actions.viewProfile({ fid });
    } catch(error: any){
      throw new Error(error);
    }
  }

  const handleShareCast = async() => {
    try{
      await sdk.actions.composeCast({
        text: "I just found this video on /tap!",
        embeds: [`https://warpcast.com/${cast.author.username}/${cast.hash.slice(0, 10)}`]
      });
    } catch(error: any){
      throw new Error(error);
    }
  }

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
            // eslint-disable-next-line import/no-named-as-default-member
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
    <div className="relative w-full max-w-[340px] md:max-w-[360px] aspect-[9/16] rounded-2xl overflow-hidden">
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
          <img
            src={cast.author?.pfp_url ?? USER_FALLBACK_IMG_URL}
            alt={`@${cast.author.username}'s PFP`}
            className="size-full object-cover cursor-pointer"
            onClick={() => handleViewProfile(cast.author.fid)}
          />
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
          <Button
            variant="ghost"
            size="icon"
            className="flex items-center justify-center rounded-full bg-black/40 hover:bg-black/75 transition-colors p-2"
            onClick={handleShareCast}
          >
            <Share2 className="size-4" />
          </Button>
      </div>
    </div>
  )
})

VideoPlayer.displayName = "VideoPlayer"

interface VirtualItem {
  index: number
  start: number
}

export function CastVideos({ session }: { session: Session | null }) {
  const [selectedTab, setSelectedTab] = useState<"trending" | "your profile">("trending")
  const [isMobile, setIsMobile] = useState(false)
  const feedUrl = useMemo(() => {
    if (selectedTab === "your profile" && session?.user) {
      return `/api/farcaster/cast/videos/${(session.user as any).fid}`
    }
    return "/api/farcaster/cast/videos"
  }, [selectedTab, session])
  const { data, error: isError, isLoading } = useSWR<{ result: { casts: NeynarCastV2[], next: string } }>(feedUrl, fetcher)
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
    if (!data?.result?.casts) return []
    const filtered = data.result.casts.filter((cast) => 
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
  }, [data])

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

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-start mt-[10%] h-full">
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
  
    if (!data) return null

    return(
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
              className={`video-container absolute top-0 left-0 w-full h-screen flex ${!isMobile || (virtualRow.index === 0) ? 'items-center' : 'items-start'} justify-center snap-center snap-always -mt-12`}
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
    )
  }

  return (
    <div className="flex justify-center items-center w-full min-h-screen">
      <div className="relative w-full max-w-[360px] h-screen">
        <div
          className="fixed z-20 w-auto max-w-[360px] pt-2"
          style={{
            top: 0,
            left: isMobile ? "55px" : "auto"
          }}
        >
          {/* <div className="flex items-center space-x-1">
            <button
              onClick={() => setSelectedTab("trending")}
              className={cn(
                "text-black dark:text-white font-normal px-2 py-1 rounded transition-colors cursor-pointer",
                selectedTab === "trending" ? "font-medium" : "opacity-70 hover:opacity-100"
              )}
            >
              Trending
            </button>
            {session ? 
              <button
                onClick={() => setSelectedTab("your profile")}
                className={cn(
                  "text-black dark:text-white font-normal px-2 py-1 rounded transition-colors cursor-pointer",
                  selectedTab === "your profile" ? "font-medium" : "opacity-70 hover:opacity-100"
                )}
              >
                Your Profile
              </button>
            : null}
          </div> */}
        </div>
        {renderBody()}
      </div>
    </div>
  )
}

export function CastVideosPageWrapper({ session }: { session: Session | null }){
  const isMobile = useIsMobile()
  return(
    <div className="mt-12 md:mt-0 message-container">
      {!isMobile && <VideoHeader />}
      <CastVideos session={session} />
    </div>
  )
}