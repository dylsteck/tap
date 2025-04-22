/* eslint-disable @next/next/no-img-element */
"use client";

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Session } from "next-auth";

import { VideoHeader } from '@/components/custom/video-header';
import { NeynarCastV2 } from '@/components/farcasterkit/common/types/neynar';
import { WarpcastTrendingTopicsResponse, WarpcastCast } from '@/components/farcasterkit/common/types/warpcast';
import { Cast } from '@/components/farcasterkit/react/cast';
import FrameLink from '@/components/farcasterkit/react/utils/frame-link';
import { Skeleton } from '@/components/ui/skeleton';
import { tapSDK } from '@/lib/api';
import { cn, USER_FALLBACK_IMG_URL } from '@/lib/utils';

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

function TopicCasts({ topicId, enabled }: { topicId: string; enabled: boolean }) {
  const { data: casts, isLoading, error } = useQuery<WarpcastCast[], Error>({
    queryKey: ['topicCasts', topicId],
    queryFn: () => tapSDK.getTopicCastsById(topicId),
    enabled: enabled,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        <Skeleton className="h-24 w-full max-w-lg mx-auto" />
        <Skeleton className="h-24 w-full max-w-lg mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center text-red-600 mt-4 p-4 bg-red-50 rounded-lg max-w-lg mx-auto">
        <AlertCircle className="mr-2 size-5" />
        Error loading casts: {error.message}
      </div>
    );
  }

  if (!casts || casts.length === 0) {
    return <p className="text-center text-muted-foreground mt-4">No casts found for this topic.</p>;
  }

  return (
    <div className="mt-4 space-y-4">
      {casts.map((cast) => (
        <Cast key={cast.hash} cast={convertWarpcastToNeynarCast(cast)} />
      ))}
    </div>
  );
}

export function TrendingTopicsStories({ session }: { session: Session | null }){
    const { data: topicsResponse, isLoading: isLoadingTopics, error: topicsError } = useQuery<WarpcastTrendingTopicsResponse, Error>({
      queryKey: ['trendingTopics'],
      queryFn: () => tapSDK.getTrendingTopics(),
      enabled: !!session,
    });

    if (!session) {
      return <div className="text-center p-8">Please log in to see trending stories.</div>;
    }

    if (isLoadingTopics) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
          <Loader2 className="size-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading trending stories...</p>
        </div>
      );
    }

    if (topicsError) {
      return (
        <div className="flex flex-col items-center justify-center text-red-600 mt-8 p-6 bg-red-50 rounded-lg max-w-md mx-auto">
          <AlertCircle className="mr-2 size-8 mb-2" />
          <p className="font-semibold">Error loading topics:</p>
          <p>{topicsError.message}</p>
        </div>
      );
    }

    const topics = topicsResponse?.result?.topics;

    if (!topics || topics.length === 0) {
      return <div className="text-center p-8 text-muted-foreground">No trending stories found right now.</div>;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <VideoHeader />
        <h1 className="text-3xl font-bold text-center mb-8">Trending Stories</h1>
        <div className="space-y-12">
          {topics.map((topic) => (
            <section key={topic.id} className="border-b pb-8 last:border-b-0">
              <h2 className="text-2xl font-semibold mb-4 text-center">{topic.displayName}</h2>
              <TopicCasts topicId={topic.id} enabled={!!session} />
            </section>
          ))}
        </div>
      </div>
    )
}