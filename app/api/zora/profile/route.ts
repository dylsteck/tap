import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ZORA_API_KEY = process.env.ZORA_API_KEY;
const BASE_URL = 'https://api-sdk.zora.engineering';

// Get profile/wallet coin holdings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('identifier'); // Address or username

    if (!identifier) {
      return NextResponse.json(
        { error: 'Profile identifier required (address or username)' },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (ZORA_API_KEY) {
      headers['api-key'] = ZORA_API_KEY;
    }

    // Fetch profile data from Zora Coins API
    const response = await fetch(
      `${BASE_URL}/profile?identifier=${identifier}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Zora API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error('Zora Profile API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

