import { auth } from "@/app/(auth)/auth";
import { neynar } from "@/components/farcasterkit/services/neynar";
import { checkKey, setKey } from "@/lib/redis";
import { authMiddleware, WARPCAST_API_URL, NEYNAR_API_URL } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const cacheKey = "cast:videos:trending";
  const cacheEx = 21600;
  const cacheServerHeaders = {
    "Cache-Control": `public, s-maxage=${cacheEx}, stale-while-revalidate=${cacheEx}`,
    "x-cache-tags": cacheKey
  };
  const cacheRespInit: ResponseInit = { status: 200, headers: cacheServerHeaders };
  await checkKey(cacheKey, cacheRespInit);

  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    return new Response("NEYNAR_API_KEY is not set in the environment variables", { status: 500 });
  }

  const data = await neynar.castSearch({
    q: "stream.warpcast.com",
    priority_mode: true,
    limit: 25,
    viewer_fid: session && session?.user ? (session?.user as any).fid : 3
  });
  
  const finalResp = {
    result: {
      casts: data.result.casts.sort((a: any, b: any) => b.reactions.likes_count - a.reactions.likes_count),
      next: data.result.next
    }
  };

  const setKeyResp = await setKey(cacheKey, JSON.stringify(finalResp), cacheEx, cacheRespInit);
  return setKeyResp;
}