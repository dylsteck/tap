'use client';

import { Session } from 'next-auth';

import { ChatHeader } from '@/components/custom/chat-header';
import CastVideos from '@/components/custom/farcasterkit/react/cast/videos';
import { useIsMobile } from '@/hooks/use-mobile';

export default function VideosPage({ user, session }: { user?: any, session: Session | null}) {
  const isMobile = useIsMobile();
  // TODO: guard auth'd actions(eg. tipping) to authenticated-only users with the session
  return(
    <div>
      {!isMobile && <ChatHeader />}
      <CastVideos user={user} />
    </div>
  );
}