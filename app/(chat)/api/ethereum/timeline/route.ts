import { NextResponse } from 'next/server';

import { redis, ZAPPER_GQL_URL } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const cacheKey = `zapper:timeline:${address}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      try {
        const parsedData = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
        return NextResponse.json(parsedData);
      } catch (parseError) {
        console.error('Error parsing cached timeline data:', parseError);
      }
    }

    const query = `
      query (
        $addresses: [Address!],
        $realtimeInterpretation: Boolean,
        $isSigner: Boolean
      ) {
        accountsTimeline (
          addresses: $addresses,
          realtimeInterpretation: $realtimeInterpretation,
          isSigner: $isSigner
        ) {
          edges {
            node {
              transaction {
                hash
                fromUser {
                  address
                  displayName {
                    value
                  }
                  ensRecord {
                    name
                  }
                }
                toUser {
                  address
                  displayName {
                    value
                  }
                  ensRecord {
                    name
                  }
                }
                network
                timestamp
                transactionPrice
                transactionFee
                value
                input
                gasPrice
                gas
              }
              interpretation {
                processedDescription
              }
            }
          }
        }
      }
    `;

    const variables = {
      addresses: [
        address
      ],
      isSigner: true,
      realtimeInterpretation: true
    };

    const response = await fetch(ZAPPER_GQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(process.env.ZAPPER_API_KEY ?? '')}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch timeline data: ${response.status}`);
    }

    const data = await response.json();
    await redis.set(cacheKey, JSON.stringify(data), { ex: 60 * 15 });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline data' },
      { status: 500 }
    );
  }
}