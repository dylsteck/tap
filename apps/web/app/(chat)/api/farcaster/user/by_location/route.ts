import { auth } from "@/app/(auth)/auth";
import { neynar } from "@/components/farcasterkit/services/neynar";
import { checkKey, setKey } from "@/lib/redis";
import { authMiddleware, CACHE_EX_SECONDS } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const url = new URL(request.url);
  const latitude = url.searchParams.get("latitude");
  const longitude = url.searchParams.get("longitude");
  const viewer_fid = url.searchParams.get("viewer_fid") || "3";
  const limit = url.searchParams.get("limit") || "25";
  const cursor = url.searchParams.get("cursor") || "";

  if (!latitude || !longitude) {
    return new Response(JSON.stringify("Latitude and longitude parameters are required!"), { status: 400 });
  }

  const cacheKey = `user_by_location:${latitude}:${longitude}:${viewer_fid}:${limit}:${cursor}`;
  const cacheEx = CACHE_EX_SECONDS;
  const cacheServerHeaders = {
    "Cache-Control": `public, s-maxage=${cacheEx}, stale-while-revalidate=${cacheEx}`,
    "x-cache-tags": cacheKey
  };
  const cacheRespInit: ResponseInit = { status: 200, headers: cacheServerHeaders };
  const cachedData = await checkKey(cacheKey, cacheRespInit);

  if (cachedData) {
    return cachedData;
  }

  try {
    const data = await neynar.getUserByLocation({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      viewer_fid: parseInt(viewer_fid),
      limit: parseInt(limit),
      cursor: cursor || undefined
    });

    const setKeyResp = await setKey(cacheKey, JSON.stringify(data), cacheEx, cacheRespInit);
    return setKeyResp;
  } catch {
    return new Response(JSON.stringify("Failed to fetch data from Neynar API!"), { status: 500 });
  }
}