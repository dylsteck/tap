import { auth } from "@/app/(auth)/auth";
import { getFarcasterApps } from "@/db/queries";
import { checkKey, setKey } from "@/lib/redis";
import { authMiddleware } from "@/lib/utils";

export async function GET(request: Request) {
    const session = await auth();
    const authResponse = authMiddleware(session, request.url, request.headers);
    if (authResponse) {
        return authResponse;
    }

    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");

    const cacheKey = cursor ? `app_list:${cursor}` : "app_list";
    const cacheEx = 604800;
    const cacheServerHeaders = {
        "Cache-Control": `public, s-maxage=${cacheEx}, stale-while-revalidate=${cacheEx}`,
        "x-cache-tags": cacheKey
    };
    const cacheRespInit: ResponseInit = { status: 200, headers: cacheServerHeaders };
    await checkKey(cacheKey, cacheRespInit);

    const data = await getFarcasterApps(cursor ? parseInt(cursor) : 0);

    const setKeyResp = await setKey(cacheKey, JSON.stringify(data), cacheEx, cacheRespInit);
    return setKeyResp;
}