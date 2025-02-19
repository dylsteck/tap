import { NextResponse } from 'next/server';

import { redis } from '@/lib/redis';
import { ZAPPER_GQL_URL } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const network = searchParams.get('network');
    const timeFrame = searchParams.get('timeFrame') || 'DAY';
    // HOUR | DAY | WEEK | MONTH | YEAR

    if (!address || !network) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const cacheKey = `zapper:token:${address}:${network}:${timeFrame}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      try {
        const parsedData = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
        return NextResponse.json(parsedData);
      } catch (parseError) {
        console.error('Error parsing cached token data:', parseError);
      }
    }

    const query = `
      query ($address: Address!, $network: Network!, $first: Float!, $currency: Currency!, $timeFrame: TimeFrame!) {
        fungibleToken(address: $address, network: $network) {
            address
            decimals
            holders(first: $first) {
            edges {
                node {
                holderAddress
                percentileShare
                value
                }
            }
            }
            imageUrl
            isVerified
            name
            onchainMarketData {
            marketCap
            price
            priceChange1h
            priceChange24h
            priceChange5m
            totalGasTokenLiquidity
            totalLiquidity
            priceTicks(currency: $currency, timeFrame: $timeFrame) {
                open
                close
                timestamp
            }
            }
            totalSupply
            credibility
            securityRisk {
            reason
            }
        }
      }
    `;

    const variables = {
        "address": address,
        "network": network,
        "first": 3,
        "currency": "USD",
        "timeFrame": timeFrame
    }
    
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
    console.error('Error fetching token data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token data' },
      { status: 500 }
    );
  }
}