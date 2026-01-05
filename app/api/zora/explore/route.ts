import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ZORA_API_KEY = process.env.ZORA_API_KEY;
const BASE_URL = 'https://api-sdk.zora.engineering';

// Explore coins (trending, new, top gainers, etc.)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'trending'; // trending, new, topGainers
    const limit = searchParams.get('limit') || '20';
    const chain = searchParams.get('chain') || '8453'; // Default to Base

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (ZORA_API_KEY) {
      headers['api-key'] = ZORA_API_KEY;
    }

    // Fetch explore data from Zora Coins API
    const response = await fetch(
      `${BASE_URL}/explore/${type}?limit=${limit}&chain=${chain}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Zora API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({ coins: data });
  } catch (error) {
    console.error('Zora Explore API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coins' },
      { status: 500 }
    );
  }
}

