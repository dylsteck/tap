import { auth } from "@/app/(auth)/auth";
import { eventcaster } from "@/components/farcasterkit/services/eventcaster";
import { checkKey, setKey } from "@/lib/redis";
import { authMiddleware } from "@/lib/utils";

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

  const cacheKey = `event:${id}`;
  const cacheEx = 3600;
  const cacheServerHeaders = {
    "Cache-Control": `public, s-maxage=${cacheEx}, stale-while-revalidate=${cacheEx}`,
    "x-cache-tags": cacheKey
  };
  const cacheRespInit: ResponseInit = { status: 200, headers: cacheServerHeaders };
  await checkKey(cacheKey, cacheRespInit);

  const data = await eventcaster.getEventById(id);
  const setKeyResp = await setKey(cacheKey, JSON.stringify(data), cacheEx, cacheRespInit);
  return setKeyResp;
}