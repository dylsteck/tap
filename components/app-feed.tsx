"use client";

import { useEffect, useState, useCallback } from "react";
import { AppCard } from "./app-card";
import { RefreshIcon } from "./icons";

export function AppFeed() {
    const [apps, setApps] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [nextCursor, setNextCursor] = useState<string | null>(null);

    const fetchFeed = useCallback(async (cursor?: string) => {
        setIsLoading(true);
        try {
            const url = cursor
                ? `/api/feed/trending?cursor=${cursor}`
                : "/api/feed/trending";

            const response = await fetch(url);
            const data = await response.json();

            if (data.apps && Array.isArray(data.apps)) {
                if (cursor) {
                    setApps(prev => [...prev, ...data.apps]);
                } else {
                    setApps(data.apps);
                }
                setNextCursor(data.nextCursor);
            }
        } catch (error) {
            console.error("Failed to fetch feed:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    if (isLoading && apps.length === 0) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black text-white">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-t-white border-white/20 animate-spin" />
                    <span className="text-zinc-500 font-medium">loading feed...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 pt-12 pb-4 bg-gradient-to-b from-black to-transparent text-white">
                <h1 className="text-2xl font-bold tracking-tight">tap</h1>
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => fetchFeed()}
                        className="hover:opacity-70 transition-opacity"
                        title="Refresh"
                    >
                        <RefreshIcon size={24} />
                    </button>
                    <SearchIcon />
                    <BellIcon />
                </div>
            </header>

            {/* Feed Items */}
            {apps.length > 0 ? (
                <>
                    {apps.map((app) => (
                        <AppCard key={app.id} app={app} />
                    ))}
                    {nextCursor && (
                        <div className="flex flex-col items-center justify-center h-[50vh] snap-start bg-black pb-32">
                            <button
                                onClick={() => fetchFeed(nextCursor)}
                                disabled={isLoading}
                                className="px-6 py-3 rounded-full bg-zinc-900 border border-white/10 text-white font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? "loading..." : "load more apps"}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="h-screen w-full flex flex-col items-center justify-center text-zinc-500 gap-6">
                    <div className="flex flex-col items-center gap-2 text-center px-6">
                        <span className="text-lg font-medium text-zinc-300">No trending apps found</span>
                        <p className="text-sm opacity-60">Farcaster might be quiet right now, or all apps are sleeping.</p>
                    </div>
                    <button
                        onClick={() => fetchFeed()}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 border border-white/10 text-white font-medium hover:bg-zinc-800 transition-colors"
                    >
                        <RefreshIcon size={18} />
                        Try again
                    </button>
                </div>
            )}
        </div>
    );
}

const SearchIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const BellIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
);
