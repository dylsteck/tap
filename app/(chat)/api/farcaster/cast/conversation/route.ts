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

  const url = new URL(request.url);
  const hash = url.searchParams.get("hash");

  if (!hash) {
    return new Response(JSON.stringify("Cast hash parameter is required!"), { status: 400 });
  }

  const cacheKey = `cast_conversation:${hash}`;
  const cacheEx = 43200;
  const cacheServerHeaders = {
    "Cache-Control": `public, s-maxage=${cacheEx}, stale-while-revalidate=${cacheEx}`,
    "x-cache-tags": cacheKey
  };
  const cacheRespInit: ResponseInit = { status: 200, headers: cacheServerHeaders };
  await checkKey(cacheKey, cacheRespInit);

  const data = await warpcast.getThreadCasts(hash);
  const setKeyResp = await setKey(cacheKey, JSON.stringify(data), cacheEx, cacheRespInit);
  return setKeyResp;
}