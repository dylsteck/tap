"use client";

import { useAuthModal } from "./auth-modal-provider";
import { useSession } from "next-auth/react";
import { MessageIcon, MoreHorizontalIcon } from "./icons";

interface AppCardProps {
    app: {
        id: string;
        name: string;
        description: string;
        url: string;
        author: string;
        authorAvatar: string;
        likes: number;
        comments: number;
        shares: number;
    };
}

// Simple internal icons as they are missing from icons.tsx
const HeartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
);

const ShareIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
);

const BookmarkIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
);

const CameraIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
    </svg>
);

export function AppCard({ app }: AppCardProps) {
    const { openAuthModal } = useAuthModal();
    const { data: session } = useSession();

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        if (!session) {
            e.preventDefault();
            e.stopPropagation();
            openAuthModal();
        }
    };

    return (
        <div className="flex flex-col items-center w-full min-h-screen snap-start bg-black pt-16 pb-32">
            {/* Main App Card */}
            <div
                className="relative w-[92%] max-w-[400px] aspect-[4/5] rounded-[40px] overflow-hidden bg-[#1a1a1a] shadow-2xl border border-white/5"
                onClickCapture={handleInteraction}
            >
                <iframe
                    src={app.url}
                    className="w-full h-full border-none"
                    title={app.name}
                    sandbox="allow-scripts allow-same-origin"
                />
            </div>

            {/* Content Info below card */}
            <div className="w-[92%] max-w-[400px] mt-4 flex flex-col gap-4">
                {/* Social Actions Row */}
                <div className="flex items-center justify-between px-2 text-white">
                    <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 hover:opacity-70 transition-opacity" onClick={handleInteraction}>
                            <HeartIcon />
                            <span className="text-sm font-medium">{app.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:opacity-70 transition-opacity" onClick={handleInteraction}>
                            <MessageIcon size={24} />
                            <span className="text-sm font-medium">{app.comments}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:opacity-70 transition-opacity" onClick={handleInteraction}>
                            <ShareIcon />
                            <span className="text-sm font-medium">{app.shares}</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <BookmarkIcon />
                        <CameraIcon />
                        <ShareIcon />
                    </div>
                </div>

                {/* User Info Row */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-purple-500 to-pink-500 border border-white/10">
                            {app.authorAvatar ? (
                                <img src={app.authorAvatar} alt={app.author} className="w-full h-full object-cover" />
                            ) : null}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-semibold text-sm">{app.author}</span>
                            <span className="text-zinc-400 text-xs">{app.description}</span>
                        </div>
                    </div>
                    <button className="text-white">
                        <MoreHorizontalIcon size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
