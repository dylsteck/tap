import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { type NextRequest, NextResponse } from "next/server";

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "NEYNAR_API_DOCS";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get("cursor") || undefined;

        const config = new Configuration({ apiKey: NEYNAR_API_KEY });
        const client = new NeynarAPIClient(config);

        const response = await client.fetchFrameCatalog({
            limit: 25,
            timeWindow: "7d" as any,
            cursor: cursor,
        });

        // Format for AppCard
        const formattedApps = response.frames.map((frame: any, index: number) => ({
            id: `${frame.author.fid}-${frame.frames_url}-${index}`,
            name: frame.manifest?.frame?.name || frame.metadata?.html?.ogTitle || frame.author.display_name || frame.author.username,
            description: frame.manifest?.frame?.description || frame.metadata?.html?.ogDescription || "",
            url: frame.frames_url,
            author: frame.author.username,
            authorAvatar: frame.author.pfp_url,
            likes: 0,
        }));

        return NextResponse.json({
            apps: formattedApps,
            nextCursor: response.next?.cursor || null
        });
    } catch (error) {
        console.error("Error fetching frame catalog:", error);
        return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
    }
}
