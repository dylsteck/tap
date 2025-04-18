import { NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { icebreaker } from "@/components/farcasterkit/services/icebreaker";
import { checkKey, setKey } from "@/lib/redis";
import { authMiddleware } from "@/lib/utils";

interface IcebreakerResponse {
  profile: {
    profiles: IcebreakerProfile[];
  };
}

interface IcebreakerProfile {
  profileID: string;
  walletAddress: string;
  avatarUrl: string;
  displayName: string;
  bio: string;
}

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const url = new URL(request.url);
  const walletAddress = url.searchParams.get("walletAddress");

  if (!walletAddress) {
    return NextResponse.json({ message: "Wallet address is required" }, { status: 400 });
  }

  const cacheKey = `icebreaker:eth:${walletAddress}`;
  const cacheEx = 1800;
  const cacheServerHeaders = {
    "Cache-Control": `public, s-maxage=${cacheEx}, stale-while-revalidate=${cacheEx}`,
    "x-cache-tags": cacheKey
  };
  const cacheRespInit: ResponseInit = { status: 200, headers: cacheServerHeaders };
  await checkKey(cacheKey, cacheRespInit);

  const data = await icebreaker.getProfileByWallet(walletAddress);
  const setKeyResp = await setKey(cacheKey, JSON.stringify(data), cacheEx, cacheRespInit);
  return setKeyResp;
}