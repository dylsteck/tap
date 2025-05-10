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

  const urlObj = new URL(request.url);
  const q = urlObj.searchParams.get("q") || "";
  const type = urlObj.searchParams.get("type") || "all";
  const fids = urlObj.searchParams.get("fids") || "";
  const page = urlObj.searchParams.get("page") || "1";

  const cacheKey = `clanker:search:${q}:${type}:${fids}:${page}`;
  const cacheEx = 1800;
  const cacheServerHeaders = {
    "Cache-Control": `public, s-maxage=${cacheEx}, stale-while-revalidate=${cacheEx}`,
    "x-cache-tags": cacheKey
  };
  const cacheRespInit: ResponseInit = { status: 200, headers: cacheServerHeaders };
  await checkKey(cacheKey, cacheRespInit);

  const data = await clanker.searchTokens({ q, type, fids, page: Number(page) });
  const setKeyResp = await setKey(cacheKey, JSON.stringify(data), cacheEx, cacheRespInit);
  return setKeyResp;
}