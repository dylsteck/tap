'use client';

import { Session } from 'next-auth';

import CastVideos from '@/components/custom/farcasterkit/react/cast/videos';
import { useIsMobile } from '@/hooks/use-mobile';

import { VideoHeader } from './video-header';

export default function VideosPage({ user, session }: { user?: any, session: Session | null}) {
  const isMobile = useIsMobile();
  return(
    <div>
      {/* {!isMobile && <VideoHeader />} */}
      <VideoHeader />
      <CastVideos user={user} />
    </div>
  );
}