"use client";

import { useEffect, useState, useCallback } from "react";
import { AppCard } from "./app-card";
import { RefreshIcon, UserIcon } from "./icons";

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
            <div className="h-screen w-full flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-[3px] border-white/5" />
                        <div className="absolute top-0 w-16 h-16 rounded-full border-[3px] border-t-white border-transparent animate-spin" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-white font-bold tracking-widest uppercase text-[10px]">Tap</span>
                        <span className="text-zinc-500 font-medium text-xs">Discovering frames...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 pt-6 pb-4 bg-black/20 backdrop-blur-md text-white">
                <div className="flex items-center gap-5">
                    <button className="text-white/70 hover:text-white transition-colors">
                        <SearchIcon size={22} />
                    </button>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <span className="text-white font-black text-xl tracking-tight">tap</span>
                </div>

                <div className="flex items-center gap-5">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
                        <UserIcon size={18} />
                    </div>
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

const SearchIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const BellIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
);
