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
  const channelIds = url.searchParams.get("channel_ids");
  const withRecasts = url.searchParams.get("with_recasts") === "true";
  const viewerId = url.searchParams.get("viewer_fid");
  const withReplies = url.searchParams.get("with_replies") === "true";
  const membersOnly = url.searchParams.get("members_only") !== "false";
  const limit = url.searchParams.get("limit") || "25";
  const cursor = url.searchParams.get("cursor");

  if (!channelIds) {
    return new Response("Missing required parameters", { status: 400 });
  }

  const cacheKey = `channels_feed:${channelIds}:${withRecasts}:${viewerId}:${withReplies}:${membersOnly}:${limit}:${cursor}`;
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
    const data = await neynar.getChannelsFeed({
      channel_ids: channelIds,
      with_recasts: withRecasts,
      viewer_fid: viewerId ? parseInt(viewerId) : undefined,
      with_replies: withReplies,
      members_only: membersOnly,
      limit: parseInt(limit),
      cursor: cursor || undefined
    });

    const setKeyResp = await setKey(cacheKey, JSON.stringify(data), cacheEx, cacheRespInit);
    return setKeyResp;
  } catch {
    return new Response(JSON.stringify("Failed to fetch channel feed from Neynar API!"), { status: 500 });
  }
}