import { auth } from "@/app/(auth)/auth";
import { getFCAppByName } from "@/db/queries";
import { authMiddleware, NEYNAR_API_URL, redis } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const { pathname } = new URL(request.url);
  const name = pathname.split("/").pop();

  if (!name) {
    return new Response(JSON.stringify("Query parameter 'name' is required!"), { status: 400 });
  }

  const cacheKey = `app_search:${name}`;
  const cachedData = await redis.get(cacheKey);

  if (cachedData && typeof cachedData === 'string') {
    return new Response(JSON.stringify(JSON.parse(cachedData)), { status: 200 });
  }

  const data = await getFCAppByName(name);

  // cache the data for 1 week
  await redis.set(cacheKey, JSON.stringify(data), { ex: 604800 });

  return new Response(JSON.stringify(data), { status: 200 });
}