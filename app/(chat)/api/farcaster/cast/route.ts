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

  const url = new URL(request.url);
  const identifier = url.searchParams.get("identifier");
  const type = url.searchParams.get("type");

  if (!identifier) {
    return new Response(JSON.stringify("Cast identifier parameter is required!"), { status: 400 });
  }

  if (!type || (type !== "url" && type !== "hash")) {
    return new Response(JSON.stringify("Cast type parameter is required and must be either 'url' or 'hash'!"), { status: 400 });
  }

  const cacheKey = `cast:${identifier}`;
  const cacheEx = 43200;
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
    const data = await neynar.getCast({ identifier, type });

    const finalResp = new Response(JSON.stringify(data), cacheRespInit);
    return await setKey(cacheKey, JSON.stringify(data), cacheEx, finalResp);
  } catch {
    return new Response(JSON.stringify("Failed to fetch data from NEYNAR API!"), { status: 500 });
  }
}