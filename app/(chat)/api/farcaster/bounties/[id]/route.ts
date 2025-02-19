import { NextResponse } from 'next/server';

import { auth } from "@/app/(auth)/auth";
import { Bounty } from '@/farcasterkit/common/types';
import { authMiddleware, BOUNTYCASTER_API_URL, redis } from '@/lib/utils';

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();
    
    if (!id) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }
    
    const cacheKey = `bounty:${id}`;
    const cachedBounty = await redis.get(cacheKey);

    if (cachedBounty) {
      try {
        const parsedBounty = typeof cachedBounty === 'string' ? JSON.parse(cachedBounty) : cachedBounty;
        return NextResponse.json(parsedBounty);
      } catch (parseError) {
        console.error('Error parsing cached bounty:', parseError);
        const response = await fetch(`${BOUNTYCASTER_API_URL}/bounty/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch bounty: ${response.status}`);
        }
        const bounty: Bounty = await response.json();
        await redis.set(cacheKey, JSON.stringify(bounty), { ex: 60 * 60 });
        return NextResponse.json(bounty);
      }
    }

    const response = await fetch(`${BOUNTYCASTER_API_URL}/bounty/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch bounty: ${response.status}`);
    }

    const bounty: Bounty = await response.json();
    await redis.set(cacheKey, JSON.stringify(bounty), { ex: 60 * 60 });

    return NextResponse.json(bounty);
  } catch (error) {
    console.error('Error fetching bounty:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bounty' },
      { status: 500 }
    );
  }
}