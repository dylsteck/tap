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
        <div className="fixed bottom-3 left-0 right-0 z-50 flex items-center justify-center gap-5 px-6 pointer-events-none">
            {/* Main Pill Nav */}
            <div className="flex h-[56px] items-center justify-around bg-[#1A1A1A]/90 border border-white/5 rounded-full px-8 backdrop-blur-2xl shadow-2xl w-[240px] pointer-events-auto">
                <Link
                    href="/"
                    className={cn(
                        "transition-all duration-300",
                        pathname === "/" ? "text-white scale-110" : "text-zinc-600 hover:text-zinc-400"
                    )}
                >
                    <HomeIcon size={24} />
                </Link>

                <Link
                    href="/apps"
                    className={cn(
                        "transition-all duration-300",
                        pathname === "/apps" ? "text-white scale-110" : "text-zinc-600 hover:text-zinc-400"
                    )}
                >
                    <PaletteIcon />
                </Link>

                <Link
                    href="/profile"
                    onClick={handleProfileClick}
                    className={cn(
                        "transition-all duration-300",
                        pathname === "/profile" ? "text-white scale-110" : "text-zinc-600 hover:text-zinc-400"
                    )}
                >
                    <UserIcon size={22} />
                </Link>
            </div>

            {/* Separate Plus Button */}
            <button className="flex h-[56px] w-[56px] items-center justify-center bg-[#1A1A1A]/90 border border-white/5 rounded-full text-zinc-500 hover:text-white transition-all active:scale-90 backdrop-blur-2xl shadow-2xl pointer-events-auto">
                <PlusIcon size={24} />
            </button>
        </div>
    );
}
