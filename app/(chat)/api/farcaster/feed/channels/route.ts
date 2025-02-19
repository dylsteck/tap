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
  const channelIds = url.searchParams.get('channel_ids');
  const withRecasts = url.searchParams.get('with_recasts') === 'true';
  const viewerId = url.searchParams.get('viewer_fid');
  const withReplies = url.searchParams.get('with_replies') === 'true';
  const membersOnly = url.searchParams.get('members_only') !== 'false';
  const limit = url.searchParams.get('limit') || '25';
  const cursor = url.searchParams.get('cursor');

  if (!channelIds) {
    return new Response("Missing required parameters", { status: 400 });
  }

  const cacheKey = `channels_feed:${channelIds}:${withRecasts}:${viewerId}:${withReplies}:${membersOnly}:${limit}:${cursor}`;
  const cachedData = await redis.get(cacheKey);

  if (cachedData && typeof cachedData === 'string') {
    return new Response(JSON.stringify(JSON.parse(cachedData)), { status: 200 });
  }

  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    return new Response("NEYNAR_API_KEY is not set in the environment variables", { status: 500 });
  }

  const queryParams = new URLSearchParams({
    channel_ids: channelIds,
    with_recasts: withRecasts.toString(),
    with_replies: withReplies.toString(),
    members_only: membersOnly.toString(),
    limit
  });

  if (viewerId) queryParams.append('viewer_fid', viewerId);
  if (cursor) queryParams.append('cursor', cursor);

  const response = await fetch(`${NEYNAR_API_URL}/farcaster/feed/channels?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      'accept': 'application/json',
      'x-api-key': apiKey
    }
  });

  if (!response.ok) {
    return new Response(JSON.stringify("Failed to fetch channel feed from Neynar API!"), { status: response.status });
  }

  const data = await response.json();
  await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 });

  return new Response(JSON.stringify(data), { status: 200 });
}