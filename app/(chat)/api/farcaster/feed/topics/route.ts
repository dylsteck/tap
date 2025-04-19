import { auth } from "@/app/(auth)/auth";
import { warpcast } from "@/components/farcasterkit/services/warpcast";
import { checkKey, setKey } from "@/lib/redis";
import { authMiddleware } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const cacheKey = "trending_topics";
  const cacheEx = 3600;
  const cacheServerHeaders = {
    "Cache-Control": `public, s-maxage=${cacheEx}, stale-while-revalidate=${cacheEx}`,
    "x-cache-tags": cacheKey
  };
  const cacheRespInit: ResponseInit = { status: 200, headers: cacheServerHeaders };
  const cachedData = await checkKey(cacheKey, cacheRespInit);

  if (cachedData) {
    return cachedData;
  }

  try {
    const data = await warpcast.getTrendingTopics();
    const setKeyResp = await setKey(cacheKey, JSON.stringify(data), cacheEx, cacheRespInit);
    return setKeyResp;
  } catch (error) {
    console.error("Failed to fetch trending topics from Warpcast API:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch trending topics from Warpcast API!";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}