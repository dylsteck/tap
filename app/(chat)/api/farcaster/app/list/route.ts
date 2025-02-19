import { auth } from "@/app/(auth)/auth";
import { getFarcasterAppByName, getFarcasterApps } from "@/db/queries";
import { redis } from "@/lib/redis";
import { authMiddleware, NEYNAR_API_URL } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");

  const cacheKey = cursor ? `app_list:${cursor}` : "app_list";
  const cachedData = await redis.get(cacheKey);

  if (cachedData && typeof cachedData === 'string') {
    return new Response(JSON.stringify(JSON.parse(cachedData)), { status: 200 });
  }

  const data = await getFarcasterApps(cursor ? parseInt(cursor) : 0);

  // cache the data for 1 week
  await redis.set(cacheKey, JSON.stringify(data), { ex: 604800 });

  return new Response(JSON.stringify(data), { status: 200 });
}