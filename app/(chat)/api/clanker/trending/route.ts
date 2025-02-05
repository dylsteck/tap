import { auth } from "@/app/(auth)/auth";
import { authMiddleware, CLANKER_API_URL, redis } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const cacheKey = "clanker:trending";
  let data = await redis.get(cacheKey);
  if (!data) {
    const response = await fetch(`${CLANKER_API_URL}/tokens/trending`, {
        headers: {
            'x-api-key': process.env.CLANKER_API_KEY ?? ''
        }
    });
    if (!response.ok) return new Response("Failed to fetch data from Clanker API!", { status: response.status });
    data = await response.json();
    await redis.set(cacheKey, JSON.stringify(data), { ex: 30 * 60 });
  } else if (typeof data === "string") {
    data = JSON.parse(data);
  }
  return new Response(JSON.stringify(data), { status: 200 });
}