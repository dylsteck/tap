import { auth } from '@/app/(auth)/auth';
import VideosPage from '@/components/custom/videos-page';
import { createFrame } from '@/lib/frame';
import { BASE_URL, tapSDK, VIDEOS_BANNER_IMG_URL } from '@/lib/utils';

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

export default async function VideosUsernamePageWrapper(props: { params: Promise<any> }) {
  const params = await props.params;
  const { username } = params;
  const user = await tapSDK.getFarcasterUser(username);
  // TODO: throw error/redirect when there's no user 
  const session = await auth();
  return <VideosPage user={user} session={session} />
}