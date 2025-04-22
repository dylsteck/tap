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
  const fid = url.searchParams.get("fid");
  const viewer_fid = url.searchParams.get("viewer_fid");
  const limit = url.searchParams.get("limit") || "25";
  const cursor = url.searchParams.get("cursor");
  const include_replies = url.searchParams.get("include_replies") !== "false";
  const parent_url = url.searchParams.get("parent_url");
  const channel_id = url.searchParams.get("channel_id");

  if (!fid) {
    return new Response("Missing required fid parameter", { status: 400 });
  }

  const cacheKey = `user_casts:${fid}:${viewer_fid}:${limit}:${cursor}:${include_replies}:${parent_url}:${channel_id}`;
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
    const data = await neynar.getUserCasts({
      fid: parseInt(fid),
      viewer_fid: viewer_fid ? parseInt(viewer_fid) : undefined,
      limit: parseInt(limit),
      cursor: cursor || undefined,
      include_replies,
      parent_url: parent_url || undefined,
      channel_id: channel_id || undefined
    });

    const setKeyResp = await setKey(cacheKey, JSON.stringify(data), cacheEx, cacheRespInit);
    return setKeyResp;
  } catch {
    return new Response(JSON.stringify("Failed to fetch data from Neynar API!"), { status: 500 });
  }
}