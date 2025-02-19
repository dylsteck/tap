import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from "@/app/(auth)/auth";
import { Bounty } from '@/farcasterkit/common/types';
import { authMiddleware, BOUNTYCASTER_API_URL, redis } from '@/lib/utils';

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
  try {
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
    const queryParams = new URLSearchParams();
    queryParams.append('status', status);
    queryParams.append('eventSince', eventsSince);
    if (minUsdValue) {
      queryParams.append('minUsdValue', minUsdValue);
    }
    const cacheKey = `bounties:${status}:${eventsSince}:${minUsdValue || 'none'}`;
    const cachedBounties = await redis.get(cacheKey);
    if (cachedBounties) {
      try {
        const parsedBounties = typeof cachedBounties === 'string' ? JSON.parse(cachedBounties) : cachedBounties;
        return NextResponse.json(parsedBounties);
      } catch {}
    }
    const response = await fetch(`${BOUNTYCASTER_API_URL}/bounties?${queryParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch bounties: ${response.status}`);
    }
    const bounties: Bounty[] = await response.json();
    await redis.set(cacheKey, JSON.stringify(bounties), { ex: 60 * 60 });
    return NextResponse.json(bounties);
  } catch(error) {
    return NextResponse.json({ error: 'Failed to fetch bounties' }, { status: 500 });
  }
}