'use client';

import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { useEffect } from 'react';

import { ChatHeader } from '@/components/custom/chat-header';
import CastVideos from '@/components/custom/farcasterkit/react/cast/videos';
import { useIsMobile } from '@/hooks/use-mobile';

export default function VideosPage({ session }: { session: Session | null}) {
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    if(!session?.user || !session){
      router.push('/');
    }
  }, [router, session])

  return(
    <div>
      {!isMobile && <ChatHeader />}
      <CastVideos />
    </div>
  );
}