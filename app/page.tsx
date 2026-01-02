import { auth } from "./(auth)/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

export default function Page() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background" />}>
            <LandingPageContent />
        </Suspense>
    );
}

async function LandingPageContent() {
    const session = await auth();

    if (session?.user) {
        redirect("/chat");
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <main className="max-w-4xl w-full flex flex-col items-center text-center gap-8">
                <div className="space-y-4">
                    <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl">
                        tap
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-[600px]">
                        it just takes one tap.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <Button asChild size="lg" className="flex-1">
                        <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="flex-1">
                        <Link href="/register">Sign Up</Link>
                    </Button>
                </div>

                <div className="mt-12">
                    <Button asChild variant="ghost">
                        <Link href="/chat">Continue as Guest</Link>
                    </Button>
                </div>
            </main>
        </div>
    );
}
