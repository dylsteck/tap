"use client";

import Link from "next/link";
import { useAuthModal } from "./auth-modal-provider";
import { useSession } from "next-auth/react";
import { HomeIcon, UserIcon, PlusIcon } from "./icons";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const PaletteIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.707-.484 2.103-1.206.35-.64.587-.828 1.147-.828.647 0 1.25.553 1.25 1.201V22c2.777-1.157 5-3.66 5-7.143C22 7.8 17.5 2 12 2Z" />
    </svg>
);

export function BottomNav() {
    const { openAuthModal } = useAuthModal();
    const { data: session } = useSession();
    const pathname = usePathname();

    const handleProfileClick = (e: React.MouseEvent) => {
        if (!session) {
            e.preventDefault();
            openAuthModal();
        }
    };

    return (
        <div className="fixed bottom-10 left-0 right-0 z-50 flex items-center justify-center gap-4 px-6 pointer-events-none">
            {/* Main Pill Nav */}
            <div className="flex h-[60px] items-center justify-around bg-zinc-900/90 border border-white/10 rounded-full px-6 backdrop-blur-xl shadow-2xl w-[220px] pointer-events-auto">
                <Link
                    href="/"
                    className={cn(
                        "transition-colors",
                        pathname === "/" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                    )}
                >
                    <HomeIcon size={26} />
                </Link>

                <Link
                    href="/apps"
                    className={cn(
                        "transition-colors",
                        pathname === "/apps" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                    )}
                >
                    <PaletteIcon />
                </Link>

                <Link
                    href="/profile"
                    onClick={handleProfileClick}
                    className={cn(
                        "transition-colors",
                        pathname === "/profile" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                    )}
                >
                    <UserIcon />
                </Link>
            </div>

            {/* Separate Plus Button */}
            <button className="flex h-[60px] w-[60px] items-center justify-center bg-zinc-900/90 border border-white/10 rounded-full text-zinc-400 hover:text-white transition-colors backdrop-blur-xl shadow-2xl pointer-events-auto">
                <PlusIcon size={28} />
            </button>
        </div>
    );
}
