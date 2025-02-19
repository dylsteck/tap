import { auth } from '@/app/(auth)/auth';
import { VideoHeader } from '@/components/custom/video-header';
import CastVideos from '@/components/farcasterkit/react/cast/videos';
import { createFrame } from '@/lib/frame';
import { BASE_URL, VIDEOS_BANNER_IMG_URL } from '@/lib/utils';

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
  return(
    <div>
      <VideoHeader />
      <CastVideos session={session} />
    </div>
  );
}