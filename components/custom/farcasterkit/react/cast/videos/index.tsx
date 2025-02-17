"use client"

import { motion } from "framer-motion"
import Hls from "hls.js"
import { DollarSign, MoreVertical, Volume2, VolumeX, Loader2, ExternalLink, Maximize2 } from "lucide-react"
import Image from "next/image"
import React, { useState, useEffect, useRef } from "react"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { fetcher } from "@/lib/utils"

import FrameLink from "../../utils/frame-link"

export default function CastVideos() {
  const { data: feed, error: isError, isLoading } = useSWR<any>("/api/farcaster/cast/videos", fetcher)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({})
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({})
  const containerRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!feed?.casts?.length) return
    const newMutedStates: Record<string, boolean> = {}
    feed.casts.forEach((cast: any) => {
      newMutedStates[cast.hash] = true
    })
    setMutedStates(newMutedStates)
  }, [feed])

  useEffect(() => {
    if (!feed?.casts?.length) return
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.8
    }
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const hash = entry.target.getAttribute("data-hash")
          if (hash) {
            const video = videoRefs.current[hash]
            if (video) {
              video.load()
              video.play().catch(() => {})
              setCurrentIndex(parseInt(entry.target.getAttribute("data-index") || "0"))
            }
          }
        } else {
          const hash = entry.target.getAttribute("data-hash")
          if (hash) {
            const video = videoRefs.current[hash]
            if (video) {
              video.pause()
              video.currentTime = 0
              setMutedStates((prev) => ({ ...prev, [hash]: true }))
              video.load()
            }
          }
        }
      })
    }, options)
    const videos = document.querySelectorAll(".video-container")
    videos.forEach((video) => observerRef.current?.observe(video))
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [feed])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Loader2 className="size-8 text-white" />
        </motion.div>
      </div>
    )
  }

  if (isError) {
    return <div className="flex justify-center items-center h-screen">Error loading feed. Please try again later.</div>
  }

  if (!feed) return null

  function toggleMute(hash: string) {
    setMutedStates((prev) => ({ ...prev, [hash]: !prev[hash] }))
  }

  function handleExpand(hash: string) {
    const video = videoRefs.current[hash]
    if (video) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      } else if ((video as any).webkitEnterFullscreen) {
        (video as any).webkitEnterFullscreen()
      }
    }
  }

  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-black">
      <div className="relative w-full max-w-[360px] h-screen">
        <div ref={containerRef} className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none">
          {feed.casts.map((cast: any, index: number) => {
            const videoEmbed = cast.embeds?.find((embed: any) => (embed.metadata?.content_type?.startsWith("video/") || embed.url.endsWith(".m3u8")))
            if (!videoEmbed) return null
            const isMuted = mutedStates[cast.hash]
            return (
              <div
                key={cast.hash}
                data-hash={cast.hash}
                data-index={index}
                className="video-container relative flex items-center justify-center h-screen snap-start snap-always"
              >
                <div className="relative w-full max-w-[360px] aspect-[9/16] bg-black rounded-2xl overflow-hidden">
                  <video
                    ref={(el) => {
                      if (el) {
                        const videoUrl = videoEmbed.url
                        videoRefs.current[cast.hash] = el
                        if (Hls.isSupported() && videoUrl.includes(".m3u8")) {
                          const hls = new Hls()
                          hls.loadSource(videoUrl)
                          hls.attachMedia(el)
                        } else {
                          el.src = videoUrl
                          el.load()
                        }
                        el.addEventListener("fullscreenchange", () => {
                          if (!document.fullscreenElement) {
                            el.play().catch(() => {})
                          }
                        })
                      }
                    }}
                    className="absolute inset-0 size-full object-cover"
                    loop
                    playsInline
                    muted={isMuted}
                    autoPlay
                  />
                  <div className="absolute right-4 bottom-8 flex flex-col items-center gap-4 z-10">
                    <div className="size-10 rounded-full overflow-hidden bg-black/40 ring-2 ring-white">
                      <FrameLink type="profile" identifier={cast.author.fid}>
                        <Image
                          src={cast.author?.pfp_url || "/placeholder.svg"}
                          alt=""
                          fill
                          className="object-cover rounded-full cursor-pointer"
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
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleExpand(cast.hash)}>
                          <Maximize2 className="mr-2 size-4" />
                          Expand
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}