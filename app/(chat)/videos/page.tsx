import { auth } from '@/app/(auth)/auth';
import VideosPage from '@/components/custom/videos-page';
import { createFrame } from '@/lib/frame';
import { BASE_URL, VIDEOS_BANNER_IMG_URL } from '@/lib/utils';

export async function generateMetadata() {
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
      "fc:frame": JSON.stringify(createFrame("watch videos", VIDEOS_BANNER_IMG_URL, "/videos"))
    }
  }
};

export default async function VideosPageWrapper() {
  const session = await auth();
  return <VideosPage session={session} />
}