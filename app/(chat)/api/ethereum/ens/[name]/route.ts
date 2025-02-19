import { NextResponse } from 'next/server';

import { redis } from '@/lib/redis';
import { ENSData } from '@/lib/types';
import { ENS_DATA_API_URL } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const name = pathname.split("/").pop();
    const cacheKey = `zapper:ens:${name}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      try {
        const parsedData = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
        return NextResponse.json(parsedData);
      } catch (parseError) {
        console.error('Error parsing cached ENS data:', parseError);
      }
    }

    const response = await fetch(`${ENS_DATA_API_URL}/${name}?expiry=true`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ENS data: ${response.status}`);
    }

    const ensData: ENSData = await response.json();
    await redis.set(cacheKey, JSON.stringify(ensData), { ex: 60 * 60 });
    return NextResponse.json(ensData);
  } catch (error) {
    console.error('Error fetching ENS data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ENS data' },
      { status: 500 }
    );
  }
}