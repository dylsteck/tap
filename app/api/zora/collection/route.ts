import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ZORA_API_KEY = process.env.ZORA_API_KEY;
const BASE_URL = 'https://api-sdk.zora.engineering';

// Get coin information by address
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || '8453'; // Default to Base

    if (!address) {
      return NextResponse.json(
        { error: 'Coin address required' },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (ZORA_API_KEY) {
      headers['api-key'] = ZORA_API_KEY;
    }

    // Fetch coin data from Zora Coins API
    const response = await fetch(
      `${BASE_URL}/coin?address=${address}&chain=${chain}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Zora API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({ coin: data });
  } catch (error) {
    console.error('Zora API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coin' },
      { status: 500 }
    );
  }
}
