/* eslint-disable @next/next/no-img-element */
"use client";

import { useQuery } from '@tanstack/react-query';
import { Button } from '@tap/ui/components/button';
import { Skeleton } from '@tap/ui/components/skeleton';
import { useIsMobile } from '@tap/ui/hooks/use-mobile';
import { AlertCircle, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Session } from "next-auth";
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import useSWR from 'swr';

import { VideoHeader } from '@/components/custom/video-header';
import { NeynarCastV2 } from '@/components/farcasterkit/common/types/neynar';
import { WarpcastTrendingTopicsResponse, WarpcastCast } from '@/components/farcasterkit/common/types/warpcast';
import { Cast } from '@/components/farcasterkit/react/cast';
import { tapSDK } from '@tap/common';
import { cn, USER_FALLBACK_IMG_URL, fetcher } from '@/lib/utils';

type Topic = WarpcastTrendingTopicsResponse['result']['topics'][0];

function convertWarpcastToNeynarCast(cast: WarpcastCast): NeynarCastV2 {
  return {
    hash: cast.hash,
    author: {
      object: 'user',
      fid: cast.author.fid ?? 0,
      username: cast.author.username ?? '',
      display_name: cast.author.displayName ?? '',
      pfp_url: cast.author.pfp?.url ?? USER_FALLBACK_IMG_URL,
      follower_count: 0,
      following_count: 0,
      profile: { bio: { text: '' } },
      verifications: [],
      verified_addresses: { eth_addresses: [], sol_addresses: [] },
      power_badge: false,
      custody_address: '',
      viewer_context: {
        following: false,
        followed_by: false,
        blocking: false,
        blocked_by: false,
      },
    },
    text: cast.text ?? '',
    timestamp: new Date(cast.timestamp).toISOString(),
    embeds: [],
    frames: [],
    reactions: {
      likes_count: Number(cast.reactions?.count ?? 0),
      recasts_count: Number(cast.recasts?.count ?? 0),
      likes: [],
      recasts: [],
    },
    replies: {
      count: Number(cast.replies?.count ?? 0),
    },
    mentioned_profiles: [],
    parent_hash: '' as string | null,
    parent_url: null,
    thread_hash: cast.hash,
    parent_author: null as any,
    channel: {
      id: '',
      url: '',
      name: '',
      description: '',
      follower_count: 0,
      image_url: '',
      created_at: 0,
      parent_url: '' as string | null,
      lead: null as any,
      hosts: [],
      moderator: null as any,
      object: 'channel_dehydrated'
    } as any,
    app: {
        object: '',
        fid: -1,
        username: '',
        display_name: '',
        pfp_url: '',
    },
    object: 'cast_dehydrated',
    root_parent_url: null,
    mentioned_profiles_ranges: [],
    mentioned_channels: [],
    mentioned_channels_ranges: [],
    viewer_context: { liked: false, recasted: false },
  };
}

function TopicStoryViewer({ topicId, topicName, onClose }: { topicId: string; topicName: string; onClose: () => void }) {
  const { data: topicCastsData, error, isLoading } = useSWR(
    `/api/farcaster/feed/topics/${topicId}`,
    fetcher,
    {
      onError: (err) => {
        console.error("Error fetching topic casts:", err);
      }
    }
  );

  const [currentCastIndex, setCurrentCastIndex] = useState(0);
  const isMobile = useIsMobile();

  const neynarCasts = useMemo(() => {
    if (!topicCastsData) return [];
    
    let rawCasts: WarpcastCast[] = [];

    if (topicCastsData.result?.casts) {
      rawCasts = topicCastsData.result.casts;
    } else if (Array.isArray(topicCastsData)) {
      rawCasts = topicCastsData; 
    } else if (Array.isArray(topicCastsData.casts)) {
      rawCasts = topicCastsData.casts;
    } else {
      console.log("Topic casts data structure unknown or empty:", topicCastsData);
      return [];
    }

    return rawCasts.map(convertWarpcastToNeynarCast);

  }, [topicCastsData]);

  const goToNextCast = useCallback(() => {
    setCurrentCastIndex((prev) => Math.min(prev + 1, (neynarCasts?.length ?? 1) - 1));
  }, [neynarCasts]);

  const goToPreviousCast = useCallback(() => {
    setCurrentCastIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    const clickX = e.clientX;
    const third = window.innerWidth / 3;
    if (clickX < third) {
      goToPreviousCast();
    } else {
      goToNextCast();
    }
  };

  useEffect(() => {
     if (neynarCasts && neynarCasts.length > 0 && currentCastIndex >= neynarCasts.length) {
        onClose();
     }
  }, [currentCastIndex, neynarCasts, onClose])

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
            <VideoHeader />
            <div className="flex items-center justify-center h-full">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        </>
      );
    }

    if (error) {
      return (
        <>
            <VideoHeader />
            <div className="flex flex-col items-center justify-center h-full text-red-600 p-4 bg-red-50 rounded-lg mx-4">
                <AlertCircle className="mr-2 size-6 mb-2" />
                <p className="font-semibold">Error loading casts:</p>
                <p>{error.message}</p>
            </div>
        </>
      );
    }

    if (!neynarCasts || neynarCasts.length === 0) {
      return (
      <>
        <VideoHeader />
        <p className="text-center text-muted-foreground mt-4 px-4 flex items-center justify-center h-full">No casts found for this topic.</p>
      </>);
    }

    const currentCast = neynarCasts[currentCastIndex];

    return (
       <div className="relative size-full flex items-center justify-center p-4 overflow-hidden" onClick={handleInteraction}>
         <div className="absolute left-0 top-0 h-full w-1/3 z-10 cursor-pointer"></div>
         <div className="absolute right-0 top-0 h-full w-1/3 z-10 cursor-pointer"></div>
         
         <div className="bg-card border rounded-lg shadow-lg w-full max-w-lg mx-auto z-0">
            {currentCast && <Cast key={currentCast.hash} cast={currentCast} />}
         </div>
       </div>
    );
  }

  const totalCasts = neynarCasts?.length ?? 0;

  return (
    <div className={cn(
      "absolute inset-0 bg-background flex flex-col overflow-hidden z-50",
      isMobile ? "size-full" : "max-w-[360px] aspect-[9/16] rounded-2xl m-auto"
    )}>
      <div className="sticky top-0 z-30 flex items-center p-2 bg-background/80 backdrop-blur-sm border-b">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1 ml-2 overflow-hidden">
           <h2 className="text-md font-semibold truncate">{topicName}</h2>
        </div>
      </div>
       {totalCasts > 0 && (
         <div className="relative top-0 left-0 w-full h-1 flex space-x-1 px-2 z-30">
           {Array.from({ length: totalCasts }).map((_, index) => (
             <div key={index} className="flex-1 h-full rounded-full bg-muted overflow-hidden">
               <div
                 className={cn(
                   "h-full rounded-full",
                   index < currentCastIndex ? "bg-primary" : "bg-primary/30",
                   index === currentCastIndex ? "bg-primary" : ""
                 )}
                 style={{ width: index === currentCastIndex ? '100%' : (index < currentCastIndex ? '100%' : '0%') }}
               />
             </div>
           ))}
         </div>
       )}

      <div className="grow relative">
        {renderContent()}
      </div>
    </div>
  );
}

const GRADIENT_CLASSES = [
  'from-purple-400 via-pink-500 to-red-500',
  'from-green-400 via-blue-500 to-indigo-500',
  'from-yellow-400 via-red-500 to-pink-500',
  'from-teal-400 via-cyan-500 to-blue-500',
  'from-orange-400 via-amber-500 to-yellow-500',
];

function getGradientStyle(seed: string) {
  const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % GRADIENT_CLASSES.length;
  return `bg-gradient-to-br ${GRADIENT_CLASSES[index]}`;
}

function TopicItem({ topic, session }: { topic: Topic; session: Session | null }) {
  const [showCasts, setShowCasts] = useState(false);
  const gradientClass = getGradientStyle(topic.id);
  const isMobile = useIsMobile();

  if (showCasts) {
    return (
      <TopicStoryViewer
         topicId={topic.id}
         topicName={topic.displayName}
         onClose={() => setShowCasts(false)}
       />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center cursor-pointer text-white p-8 flex-col text-center relative overflow-hidden",
        gradientClass,
        isMobile ? "size-full" : "max-w-[360px] aspect-[9/16] rounded-2xl"
      )}
      onClick={() => setShowCasts(true)}
    >
      <h2 className="text-4xl md:text-5xl font-bold drop-shadow-lg">{topic.displayName}</h2>
       <p className="mt-4 text-lg drop-shadow">Click to see casts</p>
    </div>
  );
}

export function TrendingTopicsStories({ session }: { session: Session | null }){
    const { data: topicsResponse, isLoading: isLoadingTopics, error: topicsError } = useSWR<WarpcastTrendingTopicsResponse, Error>(
      session ? '/api/farcaster/feed/topics' : null,
      fetcher
    );

    if (!session) {
      return <div className="text-center p-8 flex items-center justify-center h-screen">Please log in to see trending stories.</div>;
    }

    if (isLoadingTopics) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <Loader2 className="size-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading trending stories...</p>
        </div>
      );
    }

    if (topicsError) {
      return (
        <div className="flex flex-col items-center justify-center text-red-600 p-6 bg-red-50 rounded-lg max-w-md m-auto h-screen">
          <AlertCircle className="mr-2 size-8 mb-2" />
          <p className="font-semibold">Error loading topics:</p>
          <p>{topicsError.message}</p>
        </div>
      );
    }

    const topics = topicsResponse?.result?.topics;

    if (!topics || topics.length === 0) {
      return <div className="text-center p-8 text-muted-foreground flex items-center justify-center h-screen">No trending stories found right now.</div>;
    }

    return (
      <div className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-none">
         <VideoHeader />
        {topics.map((topic) => (
          <div key={topic.id} className="h-screen w-full snap-center snap-always flex items-center justify-center relative">
            <TopicItem topic={topic} session={session} />
          </div>
        ))}
      </div>
    )
}