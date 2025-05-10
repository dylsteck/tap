import { NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { icebreaker } from "@/components/farcasterkit/services/icebreaker";
import { checkKey, setKey } from "@/lib/redis";
import { authMiddleware } from "@/lib/utils";

interface IcebreakerCredentialProfile {
  profileID: string;
  avatarUrl: string;
  displayName: string;
  bio: string;
  primaryWalletAddress: string;
}

interface IcebreakerCredentialResponse {
  profiles: IcebreakerCredentialProfile[];
}

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const url = new URL(request.url);
  const credentialName = url.searchParams.get("credentialName");
  const limit = url.searchParams.get("limit") || "100";
  const offset = url.searchParams.get("offset") || "3";

  if (!credentialName) {
    return NextResponse.json({ message: "Credential name is required" }, { status: 400 });
  }

  const cacheKey = `icebreaker:credential:${credentialName}:limit:${limit}:offset:${offset}`;
  const cacheEx = 1800;
  const cacheServerHeaders = {
    "Cache-Control": `public, s-maxage=${cacheEx}, stale-while-revalidate=${cacheEx}`,
    "x-cache-tags": cacheKey
  };
  const cacheRespInit: ResponseInit = { status: 200, headers: cacheServerHeaders };
  await checkKey(cacheKey, cacheRespInit);

  const data = await icebreaker.getCredentialProfiles(credentialName, limit, offset);
  const setKeyResp = await setKey(cacheKey, JSON.stringify(data), cacheEx, cacheRespInit);
  return setKeyResp;
}