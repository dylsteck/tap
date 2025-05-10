export type MBDFeedResponse = {
    status_code: number;
    body: MBDCast[];
};

export type MBDCast = {
    item_id: string;
    metadata: {
        text: string;
        embed_items: string[];
        timestamp: number;
        root_parent_hash: string;
        parent_hash: string | null;
        root_parent_url: string | null;
        mentioned_profiles: number[];
        ai_labels: {
            topics: string[];
            sentiment: string[];
            emotion: string[];
            moderation: string[];
            web3_topics: string[];
        };
        app_fid: string;
        geo_location: string | null;
        author: {
            user_id: number;
            username: string;
            display_name: string;
            pfp_url: string;
        };
    };
    source_feed: string;
    score: number;
    adjusted_score: number;
};