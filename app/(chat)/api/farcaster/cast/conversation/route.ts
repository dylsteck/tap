import { auth } from "@/app/(auth)/auth";
import { WarpcastCastsResponse } from "@/components/farcasterkit/common/types/farcaster";
import { authMiddleware, WARPCAST_API_URL, redis } from "@/lib/utils";

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
  const cachedData = await redis.get(cacheKey);

  if (cachedData && typeof cachedData === 'string') {
    return new Response(JSON.stringify(JSON.parse(cachedData)), { status: 200 });
  }

  const response = await fetch(`${WARPCAST_API_URL}/v2/thread-casts?castHash=${encodeURIComponent(hash)}`, {
    method: "GET",
    headers: {
      'accept': 'application/json'
    }
  });

  if (!response.ok) {
    return new Response(JSON.stringify("Failed to fetch data from Warpcast API!"), { status: response.status });
  }

  const data = await response.json() as WarpcastCastsResponse;
  await redis.set(cacheKey, JSON.stringify(data), { ex: 43200 });

  return new Response(JSON.stringify(data), { status: 200 });
}