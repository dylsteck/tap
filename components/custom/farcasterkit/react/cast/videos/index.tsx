"use client"

import { motion } from "framer-motion"
import { DollarSign, MoreVertical, Volume2, VolumeX, Loader2 } from "lucide-react"
import Image from "next/image"
import React, { useState, useEffect, useRef } from "react"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import { fetcher } from "@/lib/utils"

import FrameLink from "../../utils/frame-link"

export default function CastVideos() {
  const { data: feed, error: isError, isLoading } = useSWR<any>("/api/farcaster/cast/videos", fetcher)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isMuted, setIsMuted] = useState<boolean>(true)
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({})
  const containerRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

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

  const handleVideoClick = (hash: string) => {
    const video = videoRefs.current[hash]
    if (video) {
      if (video.paused) {
        video.play()
      } else {
        video.pause()
      }
    }
  }

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

  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-black">
      <div className="relative w-full max-w-[360px] h-screen">
        <div ref={containerRef} className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none">
          {feed.casts.map((cast: any, index: number) => {
            const videoEmbed = cast.embeds?.find((embed: any) => embed.metadata?.content_type?.startsWith("video/"))
            if (!videoEmbed) return null

            return (
              <div
                key={cast.hash}
                data-hash={cast.hash}
                data-index={index}
                className="video-container relative flex items-center justify-center h-screen snap-start snap-always"
              >
                <div className="relative w-full max-w-[360px] aspect-[9/16] bg-black rounded-2xl overflow-hidden">
                  <video
                    ref={(el) => { if (el) videoRefs.current[cast.hash] = el }}
                    src={videoEmbed.url}
                    className="absolute inset-0 size-full object-cover"
                    loop
                    playsInline
                    muted={isMuted}
                    onClick={() => handleVideoClick(cast.hash)}
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
                    <Button variant="ghost" size="icon" className="rounded-full bg-black/40 hover:bg-black/75 transition-colors" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <VolumeX className="size-6 text-white" /> : <Volume2 className="size-6 text-white" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full bg-black/40 hover:bg-black/75 transition-colors">
                      <MoreVertical className="size-6 text-white" />
                    </Button>
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