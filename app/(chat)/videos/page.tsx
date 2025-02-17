'use client';
import Image from 'next/image';

import { auth } from '@/app/(auth)/auth';
import { ChatHeader } from '@/components/custom/chat-header';
import CastVideos from '@/components/custom/farcasterkit/react/cast/videos';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Page() {
  const isMobile = useIsMobile();

  return(
    <div>
      {!isMobile && <ChatHeader />}
      <CastVideos />
    </div>
  );
}