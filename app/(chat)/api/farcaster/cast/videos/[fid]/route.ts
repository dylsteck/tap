import { auth } from "@/app/(auth)/auth";
import { authMiddleware, WARPCAST_API_URL, redis, NEYNAR_API_URL } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }
  const { pathname } = new URL(request.url);
  const fid = pathname.split("/").pop();
  if (!fid) {
    return new Response(JSON.stringify("Query parameter 'fid' is required!"), { status: 400 });
  }
  const serverCacheHeaders = {
    "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=21600",
    "x-cache-tags": `cast:videos:${fid}`
  };
  const cacheKey = `cast:videos:${fid}`;
  const cachedData = await redis.get(cacheKey);
  if (cachedData && typeof cachedData === "string") {
    return new Response(JSON.stringify(JSON.parse(cachedData)), { status: 200, headers: serverCacheHeaders });
  }
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    return new Response("NEYNAR_API_KEY is not set in the environment variables", { status: 500 });
  }
  const response = await fetch(`${NEYNAR_API_URL}/farcaster/cast/search?q=stream.warpcast.com&priority_mode=true&limit=25&author_fid=${fid}&viewer_fid=${(session?.user as any).fid ?? 3}`, {
    method: "GET",
    headers: {
      "accept": "application/json",
      "x-api-key": apiKey
    }
  });
  if (!response.ok) {
    return new Response(JSON.stringify("Failed to fetch data from Neynar API!"), { status: response.status });
  }
  const data = await response.json();
  const finalResp = {
    casts: data.result.casts.sort((a: any, b: any) => b.reactions.likes_count - a.reactions.likes_count),
    next: data.result.next
  };
  await redis.set(cacheKey, JSON.stringify(finalResp), { ex: 21600 });
  return new Response(JSON.stringify(finalResp), { status: 200, headers: serverCacheHeaders });
}