import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const BASE_URL = COINGECKO_API_KEY 
  ? 'https://pro-api.coingecko.com/api/v3'
  : 'https://api.coingecko.com/api/v3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids') || 'ethereum';
    const currencies = searchParams.get('currencies') || 'usd';

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (COINGECKO_API_KEY) {
      headers['x-cg-pro-api-key'] = COINGECKO_API_KEY;
    }

    const response = await fetch(
      `${BASE_URL}/simple/price?ids=${ids}&vs_currencies=${currencies}&include_24hr_change=true&include_market_cap=true&include_last_updated_at=true`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('CoinGecko API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}

