import { auth } from "@/app/(auth)/auth";
import { authMiddleware, CLANKER_API_URL, redis } from "@/lib/utils";

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
  const apiUrl = new URL(`${CLANKER_API_URL}/tokens/search`);
  if (q) {
    apiUrl.searchParams.append("q", q);
  }
  apiUrl.searchParams.append("type", type);
  if (fids) {
    apiUrl.searchParams.append("fids", fids);
  }
  apiUrl.searchParams.append("page", page);
  const cacheKey = `clanker:search:${apiUrl.searchParams.toString()}`;
  let data = await redis.get(cacheKey);
  if (!data) {
    const response = await fetch(apiUrl.toString(), {
      headers: {
        "x-api-key": process.env.CLANKER_API_KEY ?? ""
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