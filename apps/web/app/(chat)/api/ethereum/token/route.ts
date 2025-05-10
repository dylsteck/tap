import { NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { zapper } from "@/components/farcasterkit/services/zapper";
import { checkKey, setKey } from "@/lib/redis";
import { authMiddleware } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const network = searchParams.get("network");
  const timeFrame = searchParams.get("timeFrame") || "DAY";
  // HOUR | DAY | WEEK | MONTH | YEAR

  if (!address || !network) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  const cacheKey = `zapper:token:${address}:${network}:${timeFrame}`;
  const cacheEx = 900;
  const cacheServerHeaders = {
    "Cache-Control": `public, s-maxage=${cacheEx}, stale-while-revalidate=${cacheEx}`,
    "x-cache-tags": cacheKey
  };
  const cacheRespInit: ResponseInit = { status: 200, headers: cacheServerHeaders };
  await checkKey(cacheKey, cacheRespInit);

  const data = await zapper.getTokenData(address, network, timeFrame);
  const setKeyResp = await setKey(cacheKey, JSON.stringify(data), cacheEx, cacheRespInit);
  return setKeyResp;
}