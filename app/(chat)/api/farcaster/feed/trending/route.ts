import { auth } from "@/app/(auth)/auth";
import { redis } from "@/lib/redis";
import { authMiddleware, NEYNAR_API_URL } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const cacheKey = 'trending_casts';
  const cachedData = await redis.get(cacheKey);

  if (cachedData && typeof cachedData === 'string') {
    return new Response(JSON.stringify(JSON.parse(cachedData)), { status: 200 });
  }

  const apiKey = process.env.NEYNAR_API_KEY
  if (!apiKey) {
    return new Response("NEYNAR_API_KEY is not set in the environment variables", { status: 500 })
  }

  const response = await fetch(`${NEYNAR_API_URL}/farcaster/feed/trending`, {
    method: "GET",
    headers: {
      'accept': 'application/json',
      'x-api-key': apiKey
    }
  });
  if (!response.ok) {
    return new Response(JSON.stringify("Failed to fetch trending feed from Neynar API!"), { status: response.status });
  }

  const data = await response.json();
  await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 });

  return new Response(JSON.stringify(data), { status: 200 });
}