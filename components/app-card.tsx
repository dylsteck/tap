"use client";

import { useAuthModal } from "./auth-modal-provider";
import { useSession } from "next-auth/react";
import { MoreHorizontalIcon } from "./icons";

interface AppCardProps {
    app: {
        id: string;
        name: string;
        description: string;
        url: string;
        author: string;
        authorAvatar: string;
        likes: number;
    };
}

// Simple internal icons as they are missing from icons.tsx
const HeartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
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

import { useEffect, useRef, useState } from "react";

export function AppCard({ app }: AppCardProps) {
    const { openAuthModal } = useAuthModal();
    const { data: session } = useSession();
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        if (!session) {
            e.preventDefault();
            e.stopPropagation();
            openAuthModal();
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: "200px" } // Load early
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div className="flex flex-col items-center w-full h-[100svh] snap-start bg-black pt-[64px] pb-[80px] overflow-hidden" ref={containerRef}>
            {/* Main App Feed Item */}
            <div className="flex-1 w-full max-w-[440px] px-3 flex flex-col min-h-0">
                {/* Iframe Container - Premium Rounded */}
                <div
                    className="flex-1 w-full rounded-[24px] overflow-hidden bg-[#0A0A0A] border border-white/5 relative shadow-2xl"
                    onClickCapture={handleInteraction}
                >
                    {isVisible ? (
                        <iframe
                            src={app.url}
                            className="w-full h-full border-none"
                            title={app.name}
                            sandbox="allow-scripts allow-same-origin"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full border-2 border-white/5 border-t-white/30 animate-spin" />
                        </div>
                    )}
                </div>

                {/* Meta Row - Gizmo Style */}
                <div className="py-3 px-1 flex flex-col gap-3 shrink-0">
                    {/* Actions Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <button className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors" onClick={handleInteraction}>
                                <HeartIcon />
                                <span className="text-xs font-medium">{app.likes > 0 ? app.likes : 'Like'}</span>
                            </button>
                            <button className="text-white/60 hover:text-white transition-colors">
                                <BookmarkIcon />
                            </button>
                            <button className="text-white/40 hover:text-white transition-colors">
                                <MoreHorizontalIcon size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Author & Description */}
                    <div className="flex items-start justify-between min-h-[50px]">
                        <div className="flex items-center gap-3.5 min-w-0">
                            <div className="relative shrink-0">
                                <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 ring-2 ring-black">
                                    {app.authorAvatar ? (
                                        <img src={app.authorAvatar} alt={app.author} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800" />
                                    )}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full border-2 border-black flex items-center justify-center">
                                    <div className="w-2.5 h-0.5 bg-black rounded-full" />
                                    <div className="absolute w-0.5 h-2.5 bg-black rounded-full" />
                                </div>
                            </div>
                            <div className="flex flex-col min-w-0 leading-tight">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-white font-bold text-[15px] tracking-tight truncate">{app.name}</span>
                                </div>
                                <span className="text-white/50 text-sm line-clamp-1 font-normal mt-0.5">
                                    {app.description || `by @${app.author}`}
                                </span>
                            </div>
                        </div>
                        <button className="px-5 py-2 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-wider hover:bg-zinc-200 transition-all active:scale-95 shrink-0">
                            Launch
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
