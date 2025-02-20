import { auth } from "@/app/(auth)/auth";
import { getFarcasterAppByName } from "@/db/queries";
import { checkKey, setKey } from "@/lib/redis";
import { authMiddleware } from "@/lib/utils";

export async function GET(request: Request) {
    const session = await auth();
    const authResponse = authMiddleware(session, request.url, request.headers);
    if (authResponse) {
        return authResponse;
    }

    const { pathname } = new URL(request.url);
    const name = pathname.split("/").pop();

    if (!name) {
        return new Response(JSON.stringify("Query parameter 'name' is required!"), { status: 400 });
    }

    const cacheKey = `app:${name}`;
    const cacheEx = 604800;
    const cacheServerHeaders = {
        "Cache-Control": `public, s-maxage=${cacheEx}, stale-while-revalidate=${cacheEx}`,
        "x-cache-tags": cacheKey
    };
    const cacheRespInit: ResponseInit = { status: 200, headers: cacheServerHeaders };
    await checkKey(cacheKey, cacheRespInit);

    const data = await getFarcasterAppByName(name);
    
    const setKeyResp = await setKey(cacheKey, JSON.stringify(data), cacheEx, cacheRespInit);
    return setKeyResp;
}