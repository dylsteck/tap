import { auth } from "@/app/(auth)/auth"
import { warpcast } from "@/components/farcasterkit/services/warpcast";
import { redis } from "@/lib/redis";
import { authMiddleware } from "@/lib/utils"

export async function GET(request: Request) {
  const session = await auth()
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const url = new URL(request.url)
  const username = url.searchParams.get("username")
  const fid = url.searchParams.get("fid")

  const cacheKey = username ? `user:${username}` : fid ? `user:${fid}` : null
  let data: any = cacheKey ? await redis.get(cacheKey) : null

  if (data === null && cacheKey) {
    try {
      if (username) {
        data = await warpcast.getUserByUsername(username);
      } else if (fid) {
        data = await warpcast.getUserByFid(fid);
      } else {
        return new Response("Username or FID parameter is required", { status: 400 });
      }
      await redis.set(cacheKey, JSON.stringify(data), { ex: 60 * 60 });
    } catch (error) {
      console.error("Failed to fetch data from Warpcast Service:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch data from Warpcast Service!";
      const statusCode = error instanceof Error && error.message.includes("status:") 
        ? parseInt(error.message.split("status: ")[1]) 
        : 500;
      return new Response(errorMessage, { status: statusCode });
    }
  } else if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse cached data:", e);
      return new Response("Failed to parse cached data", { status: 500 });
    }
  }

  if (data === null) {
      return new Response("User not found or error fetching data", { status: 404 });
  }

  return new Response(JSON.stringify(data), { status: 200 })
}