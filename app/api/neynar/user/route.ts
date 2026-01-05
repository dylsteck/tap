import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

export const dynamic = 'force-dynamic';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || 'NEYNAR_API_DOCS';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    const username = searchParams.get('username');

    if (!fid && !username) {
      return NextResponse.json(
        { error: 'fid or username required' },
        { status: 400 }
      );
    }

    const config = new Configuration({ apiKey: NEYNAR_API_KEY });
    const client = new NeynarAPIClient(config);

    if (fid) {
      const response = await client.fetchBulkUsers({ fids: [parseInt(fid)] });
      const user = response.users[0];
      return NextResponse.json({ user });
    }

    if (username) {
      const response = await client.searchUser({ q: username, limit: 1 });
      const user = response.result.users[0];
      return NextResponse.json({ user });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Neynar API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

