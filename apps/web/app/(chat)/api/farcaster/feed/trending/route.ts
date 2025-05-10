import { auth } from "@/app/(auth)/auth";
import { neynar } from "@/components/farcasterkit/services/neynar";
import { checkKey, setKey } from "@/lib/redis";
import { authMiddleware } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const cacheKey = "trending_casts";
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
    const data = await neynar.getTrendingCasts();
    const setKeyResp = await setKey(cacheKey, JSON.stringify(data), cacheEx, cacheRespInit);
    return setKeyResp;
  } catch {
    return new Response(JSON.stringify("Failed to fetch trending feed from Neynar API!"), { status: 500 });
  }
}