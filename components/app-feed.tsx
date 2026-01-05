"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthModal } from "./auth-modal-provider";

interface Project {
    id: string;
    name: string;
    description: string | null;
    status: string;
    deployedUrl: string | null;
    createdAt: string;
}

export function AppFeed() {
    const { data: session, status } = useSession();
    const { openAuthModal } = useAuthModal();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchProjects() {
            if (status === "loading") return;
            
            if (!session) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch("/api/projects");
                if (response.ok) {
                    const data = await response.json();
                    setProjects(data.projects || []);
                }
            } catch (error) {
                console.error("Failed to fetch projects:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProjects();
    }, [session, status]);

    if (status === "loading" || isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-[3px] border-white/5" />
                        <div className="absolute top-0 w-16 h-16 rounded-full border-[3px] border-t-white border-transparent animate-spin" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-white font-bold tracking-widest uppercase text-[10px]">Tap</span>
                        <span className="text-zinc-500 font-medium text-xs">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Not logged in - show welcome state
    if (!session) {
        return (
            <div className="h-screen w-full flex flex-col bg-black">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6 pt-6 pb-4 bg-black/20 backdrop-blur-md">
                    <span className="text-white font-black text-xl tracking-tight">tap</span>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
                    <div className="flex flex-col items-center gap-8 text-center max-w-sm">
                        {/* Logo/Icon */}
                        <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <SparklesIcon size={32} />
                        </div>

                        {/* Text */}
                        <div className="space-y-3">
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                Build miniapps with AI
                            </h1>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                Describe your idea, and Tap will generate a complete Farcaster miniapp ready to deploy.
                            </p>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={() => openAuthModal()}
                            className="w-full px-6 py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all"
                        >
                            Get Started
                        </button>

                        <p className="text-zinc-600 text-xs">
                            Free to use • No credit card required
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Logged in but no projects - show empty state
    if (projects.length === 0) {
        return (
            <div className="h-screen w-full flex flex-col bg-black">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6 pt-6 pb-4 bg-black/20 backdrop-blur-md">
                    <span className="text-white font-black text-xl tracking-tight">tap</span>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
                    <div className="flex flex-col items-center gap-8 text-center max-w-sm">
                        {/* Empty state icon */}
                        <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <BoxIcon size={32} />
                        </div>

                        {/* Text */}
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-white tracking-tight">
                                No apps yet
                            </h2>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                Create your first miniapp by tapping the + button below.
                            </p>
                        </div>

                        {/* CTA */}
                        <Link
                            href="/create"
                            className="px-6 py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all"
                        >
                            Create Your First App
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Has projects - show list
    return (
        <div className="h-screen w-full overflow-y-auto bg-black pb-32">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6 pt-6 pb-4 bg-black/80 backdrop-blur-xl border-b border-zinc-800/50">
                <span className="text-white font-black text-xl tracking-tight">tap</span>
            </header>

            {/* Projects List */}
            <div className="pt-20 px-4">
                <div className="max-w-[430px] mx-auto space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-bold text-white">Your Apps</h2>
                        <span className="text-sm text-zinc-500">{projects.length} total</span>
                    </div>

                    <div className="space-y-3">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProjectCard({ project }: { project: Project }) {
    const router = useRouter();
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case "deployed":
                return "bg-emerald-500";
            case "generating":
                return "bg-amber-500 animate-pulse";
            case "draft":
            default:
                return "bg-zinc-600";
        }
    };

    return (
        <button
            onClick={() => router.push(`/studio/${project.id}`)}
            className="w-full p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all text-left group"
        >
            <div className="flex items-start gap-4">
                {/* Icon/Preview */}
                <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0">
                    <AppIcon size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold truncate">{project.name}</h3>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                    </div>
                    
                    {project.description && (
                        <p className="text-zinc-500 text-sm truncate">{project.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-zinc-600">
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                        {project.deployedUrl && (
                            <span className="text-emerald-500">• Live</span>
                        )}
                    </div>
                </div>

                {/* Arrow */}
                <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors">
                    <ChevronRightIcon size={20} />
                </div>
            </div>
        </button>
    );
}

// Icons
const SparklesIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-white">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
);

const BoxIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
    </svg>
);

const AppIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
);

const ChevronRightIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
    </svg>
);
