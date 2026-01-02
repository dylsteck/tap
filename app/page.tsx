import { AppFeed } from "@/components/app-feed";
import { BottomNav } from "@/components/bottom-nav";

export default function Page() {
    return (
        <div className="relative flex flex-col h-screen overflow-hidden bg-background">
            <AppFeed />
            <BottomNav />
        </div>
    );
}
