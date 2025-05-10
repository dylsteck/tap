import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/app/(auth)/auth";
import { bountycaster } from "@/components/farcasterkit/services/bountycaster";
import { checkKey, setKey } from "@/lib/redis";
import { authMiddleware, CACHE_EX_SECONDS } from "@/lib/utils";

const statusSchema = z.enum(['all', 'open', 'open-above-1-dollar', 'in-progress', 'completed', 'expired']);
const querySchema = z.object({
  status: statusSchema,
  eventsSince: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format"
  }),
  minUsdValue: z.number().optional()
});

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const eventsSince = url.searchParams.get('eventsSince');
  const minUsdValue = url.searchParams.get('minUsdValue');

  if (!status || !eventsSince) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const queryResult = querySchema.safeParse({
    status,
    eventsSince,
    minUsdValue: minUsdValue ? parseFloat(minUsdValue) : undefined
  });

  if (!queryResult.success) {
    return NextResponse.json({ error: 'Invalid parameters', details: queryResult.error.format() }, { status: 400 });
  }

  const cacheKey = `bounties:${status}:${eventsSince}:${minUsdValue || 'none'}`;
  const cacheEx = CACHE_EX_SECONDS;
  const cacheServerHeaders = {
    "Cache-Control": `public, s-maxage=${cacheEx}, stale-while-revalidate=${cacheEx}`,
    "x-cache-tags": cacheKey
  };
  const cacheRespInit: ResponseInit = { status: 200, headers: cacheServerHeaders };
  await checkKey(cacheKey, cacheRespInit);

  const data = await bountycaster.getBounties(status, eventsSince, minUsdValue ? parseFloat(minUsdValue) : undefined);
  const setKeyResp = await setKey(cacheKey, JSON.stringify(data), cacheEx, cacheRespInit);
  return setKeyResp;
}