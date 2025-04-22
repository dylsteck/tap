import { auth } from "@/app/(auth)/auth";
import { eventcaster } from "@/components/farcasterkit/services/eventcaster";
import { checkKey, setKey } from "@/lib/redis";
import { authMiddleware, CACHE_EX_SECONDS } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const cacheKey = "events";
  const cacheEx = CACHE_EX_SECONDS;
  const cacheServerHeaders = {
    "Cache-Control": `public, s-maxage=${cacheEx}, stale-while-revalidate=${cacheEx}`,
    "x-cache-tags": cacheKey
  };
  const cacheRespInit: ResponseInit = { status: 200, headers: cacheServerHeaders };
  await checkKey(cacheKey, cacheRespInit);

  const data = await eventcaster.getEvents();
  const setKeyResp = await setKey(cacheKey, JSON.stringify(data), cacheEx, cacheRespInit);
  return setKeyResp;
}