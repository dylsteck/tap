import { createFrame, VIDEOS_BANNER_IMG_URL } from '@tap/common';
import { CastVideosPageWrapper } from '@tap/react';

import { auth } from '@/app/(auth)/auth';
import { BASE_URL } from '@/lib/utils';
import { VideoHeader } from '@/components/video-header';

export function generateMetadata() {
  const frame = createFrame("watch videos", VIDEOS_BANNER_IMG_URL, "/videos")
  return {
    title: 'videos | tap',
    description: 'it just takes one tap',
    openGraph: {
      title: 'videos | tap',
      description: 'it just takes one tap',
      images: [VIDEOS_BANNER_IMG_URL],
      url: `${BASE_URL}/videos`,
      siteName: 'tap',
      locale: 'en_US',
      type: 'website',
    },
    other: {
      "fc:frame": JSON.stringify(frame)
    }
  }
};

export default async function VideosPage() {
  const session = await auth();
  return <CastVideosPageWrapper session={session} header={<VideoHeader />} />
}