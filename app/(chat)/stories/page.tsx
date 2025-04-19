import { auth } from '@/app/(auth)/auth';
import { TrendingTopicsStories } from '@/components/farcasterkit/react/cast/topics';
import { createFrame } from '@/lib/frame';
import { BASE_URL, VIDEOS_BANNER_IMG_URL } from '@/lib/utils';

export function generateMetadata() {
  const frame = createFrame("watch stories", VIDEOS_BANNER_IMG_URL, "/stories")
  return {
    title: 'stories | tap',
    description: 'it just takes one tap',
    openGraph: {
      title: 'stories | tap',
      description: 'it just takes one tap',
      images: [VIDEOS_BANNER_IMG_URL],
      url: `${BASE_URL}/stories`,
      siteName: 'tap',
      locale: 'en_US',
      type: 'website',
    },
    other: {
      "fc:frame": JSON.stringify(frame)
    }
  }
};

export default async function StoriesPage() {
  const session = await auth();
  return <TrendingTopicsStories session={session} />
}