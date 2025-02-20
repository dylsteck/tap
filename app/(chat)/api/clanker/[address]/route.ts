import { auth } from "@/app/(auth)/auth";
import { clanker } from "@/components/farcasterkit/services/clanker";
import { checkKey, setKey } from "@/lib/redis";
import { authMiddleware } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const { pathname } = new URL(request.url);
  const address = pathname.split("/").pop();

  if (!address) {
    return new Response(JSON.stringify("Query parameter 'address' is required!"), { status: 400 });
  }

  const cacheKey = `clanker:${address}`;
  const cacheEx = 1800;
  const cacheServerHeaders = {
    "Cache-Control": `public, s-maxage=${cacheEx}, stale-while-revalidate=${cacheEx}`,
    "x-cache-tags": cacheKey
  };
  const cacheRespInit: ResponseInit = { status: 200, headers: cacheServerHeaders };
  await checkKey(cacheKey, cacheRespInit);

  const data = await clanker.getClankerByAddress(address);
  const setKeyResp = await setKey(cacheKey, JSON.stringify(data), cacheEx, cacheRespInit);
  return setKeyResp;
}