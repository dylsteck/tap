import { NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { checkKey, setKey } from "@/lib/redis";
import { ENSData } from "@/lib/types";
import { authMiddleware, CACHE_EX_SECONDS } from "@/lib/utils";

const ENS_DATA_API_URL = "https://api.ensdata.net";

export async function GET(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const name = pathname.split("/").pop();

    if (!name) {
      return NextResponse.json({ error: "Missing ENS name" }, { status: 400 });
    }

    const cacheKey = `ensdata:ens:${name}`;
    const cacheEx = CACHE_EX_SECONDS;
    const cacheServerHeaders = {
      "Cache-Control": `public, s-maxage=${cacheEx}, stale-while-revalidate=${cacheEx}`,
      "x-cache-tags": cacheKey,
    };
    const cacheRespInit: ResponseInit = { status: 200, headers: cacheServerHeaders };
    await checkKey(cacheKey, cacheRespInit);

    const response = await fetch(`${ENS_DATA_API_URL}/${name}?expiry=true`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ENS data: ${response.status}`);
    }

    const ensData: ENSData = await response.json();
    const setKeyResp = await setKey(cacheKey, JSON.stringify(ensData), cacheEx, cacheRespInit);
    return setKeyResp;
  } catch (error) {
    console.error("Error fetching ENS data:", error);
    return NextResponse.json({ error: "Failed to fetch ENS data" }, { status: 500 });
  }
}