import { auth } from "@/app/(auth)/auth";
import { nounsBuilder } from "@/components/farcasterkit/services/nouns-builder";
import { checkKey, setKey } from "@/lib/redis";
import { authMiddleware } from "@/lib/utils";

export async function GET(request: Request) {
    const session = await auth();
    const authResponse = authMiddleware(session, request.url, request.headers);
    if (authResponse) {
        return authResponse;
    }

    const url = new URL(request.url);
    const contractAddress = url.searchParams.get("contractAddress");
    const first = url.searchParams.get("first") ? parseInt(url.searchParams.get("first")!) : 100;
    const skip = url.searchParams.get("skip") ? parseInt(url.searchParams.get("skip")!) : 0;

    if (!contractAddress) {
        return new Response(JSON.stringify({ message: "Contract address is required" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const cacheKey = `nouns_builder:proposals:${contractAddress}&first=${first}&skip=${skip}`;
    const cacheEx = 1800;
    const cacheServerHeaders = {
        "Cache-Control": `public, s-maxage=${cacheEx}, stale-while-revalidate=${cacheEx}`,
        "x-cache-tags": cacheKey
    };
    const cacheRespInit: ResponseInit = { status: 200, headers: cacheServerHeaders };
    await checkKey(cacheKey, cacheRespInit);

    const proposalsData = await nounsBuilder.getProposals({ contractAddress, first, skip });

    if (!proposalsData) {
        throw new Error("Proposals data is null or undefined.");
    }

    const finalResp = {
        proposals: proposalsData.data.proposals
    };

    const setKeyResp = await setKey(cacheKey, JSON.stringify(finalResp), cacheEx, cacheRespInit);
    return setKeyResp;
}