type FarcasterIndexToken = {
  _id: string;
  id: string;
  name: string;
  description: string;
  channel: string;
  urls: {
    etherscan: string;
    warpcast: string;
    website: string;
  };
  chain: string;
  chain_id: number;
  poolAddress: string;
  tokenAddress: string;
  imageURL: string;
  createdAt: number;
  stats: {
    base_token_price_usd: string;
    base_token_price_native_currency: string;
    quote_token_price_usd: string;
    quote_token_price_native_currency: string;
    base_token_price_quote_token: string;
    quote_token_price_base_token: string;
    address: string;
    name: string;
    pool_created_at: string;
    token_price_usd: string;
    fdv_usd: string;
    market_cap_usd: string;
    price_change_percentage: {
      m5: string;
      h1: string;
      h6: string;
      h24: string;
    };
    transactions: {
      m5: {
        buys: number;
        sells: number;
        buyers: number;
        sellers: number;
      };
      m15: {
        buys: number;
        sells: number;
        buyers: number;
        sellers: number;
      };
      m30: {
        buys: number;
        sells: number;
        buyers: number;
        sellers: number;
      };
      h1: {
        buys: number;
        sells: number;
        buyers: number;
        sellers: number;
      };
      h24: {
        buys: number;
        sells: number;
        buyers: number;
        sellers: number;
      };
    };
    volume_usd: {
      m5: string;
      h1: string;
      h6: string;
      h24: string;
    };
    reserve_in_usd: string;
    total_reserve_in_usd: string;
    total_h24_volume_in_usd: string;
  };
  watchlistCount: number;
  channelStats: {
    followerCount: number;
    date: number;
    _id: string;
  }[];
  volumeStats: {
    volume_usd: string;
    date: number;
    _id: string;
  }[];
  priceStats: {
    price: string;
    date: number;
    _id: string;
  }[];
};

import { auth } from "@/app/(auth)/auth";
import { redis } from "@/lib/redis";
import { authMiddleware, FARCASTER_INDEX_API_URL } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const { pathname } = new URL(request.url);
  const name = pathname.split("/").pop();
  if (!name) {
    return new Response("Name parameter is missing in the route", { status: 400 });
  }

  const url = new URL(`${FARCASTER_INDEX_API_URL}/tokens/${name}`);

  const cacheKey = `farcaster:tokens:${name}`;
  let data: FarcasterIndexToken | null = await redis.get(cacheKey);
  if (!data) {
    const response = await fetch(url.toString());
    if (!response.ok) return new Response("Failed to fetch data from Farcaster Index API", { status: response.status });
    data = await response.json();
    await redis.set(cacheKey, JSON.stringify(data), { ex: 30 * 60 });
  } else if (typeof data === "string") {
    data = JSON.parse(data);
  }

  return new Response(JSON.stringify(data), { status: 200 });
}