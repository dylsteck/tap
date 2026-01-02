import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { type NextRequest, NextResponse } from "next/server";

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY ?? "NEYNAR_API_DOCS";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get("cursor") || undefined;

        const config = new Configuration({ apiKey: NEYNAR_API_KEY });
        const client = new NeynarAPIClient(config);

        // Use the filter feed to specifically target casts with HTML embeds (frames/miniapps)
        // We use string literals for simplicity as they match the API expectations
        const response = await client.fetchFeed({
            feedType: "filter" as any,
            filterType: "embed_types" as any,
            embedTypes: ["text/html"],
            limit: 25,
            cursor: cursor,
        });

        // Filter and format for AppCard
        const formattedApps = response.casts
            .filter((cast: any) => (cast.author.score ?? 0) >= 0.5)
            .map((cast: any) => ({
                id: cast.hash,
                name: cast.author.display_name || cast.author.username,
                description: cast.text,
                url: cast.frames?.[0]?.post_url || cast.embeds?.[0]?.url || "",
                author: cast.author.username,
                authorAvatar: cast.author.pfp_url,
                likes: cast.reactions.likes_count ?? cast.reactions.likes?.length,
                comments: cast.replies.count,
                shares: cast.reactions.recasts_count ?? cast.reactions.recasts?.length,
            }))
            .filter(app => app.url !== "");

        return NextResponse.json({
            apps: formattedApps,
            nextCursor: response.next?.cursor || null
        });
    } catch (error) {
        console.error("Error fetching trending feed:", error);
        return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
    }
}
