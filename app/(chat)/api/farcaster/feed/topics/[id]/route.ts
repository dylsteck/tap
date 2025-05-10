import { auth } from "@/app/(auth)/auth";
import { warpcast } from "@/components/farcasterkit/services/warpcast";
import { checkKey, setKey } from "@/lib/redis";
import { authMiddleware, CACHE_EX_SECONDS } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const { pathname } = new URL(request.url);
  const id = pathname.split("/").pop();

  if (!id) {
    return new Response(JSON.stringify("Query parameter 'id' is required!"), { status: 400 });
  }

  const cacheKey = `topic:${id}`;
  const cacheEx = CACHE_EX_SECONDS;
  const cacheServerHeaders = {
    "Cache-Control": `public, s-maxage=${cacheEx}, stale-while-revalidate=${cacheEx}`,
    "x-cache-tags": cacheKey
  };
  const cacheRespInit: ResponseInit = { status: 200, headers: cacheServerHeaders };
  const cachedResponse = await checkKey(cacheKey, cacheRespInit);
  if(cachedResponse){
    return cachedResponse;
  }

  try {
    const data = await warpcast.getTrendingTopicById(id);
    const setKeyResp = await setKey(cacheKey, JSON.stringify(data), cacheEx, cacheRespInit);
    return setKeyResp;
  } catch (error) {
    console.error(`Error fetching trending topic casts for ID ${id}:`, error);
    if (error instanceof Error && error.message.includes('HTTP error! status: 404')) {
        return new Response(JSON.stringify({ error: `Topic with ID ${id} not found.` }), { status: 404 });
    }
    return new Response(JSON.stringify({ error: "Failed to fetch trending topic casts." }), { status: 500 });
  }

}
