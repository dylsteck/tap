import { auth } from "@/app/(auth)/auth";
import { redis } from "@/lib/redis";
import { authMiddleware, NEYNAR_API_URL } from "@/lib/utils";

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

  const apiKey = process.env.NEYNAR_API_KEY
  if (!apiKey) {
    return new Response("NEYNAR_API_KEY is not set in the environment variables", { status: 500 })
  }

  const cacheKey = `cast:${identifier}`;
  const cachedData = await redis.get(cacheKey);

  if (cachedData && typeof cachedData === 'string') {
    return new Response(JSON.stringify(JSON.parse(cachedData)), { status: 200 });
  }

  const response = await fetch(`${NEYNAR_API_URL}/farcaster/cast?type=${type}&identifier=${identifier}`, {
    method: "GET",
    headers: {
      'accept': 'application/json',
      'x-api-key': apiKey
    }
  });

  if (!response.ok) {
    return new Response(JSON.stringify("Failed to fetch data from NEYNAR API!"), { status: response.status });
  }

  const data = await response.json();
  await redis.set(cacheKey, JSON.stringify(data), { ex: 43200 });

  return new Response(JSON.stringify(data), { status: 200 });
}