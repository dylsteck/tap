"use client";

import { useRouter } from "next/navigation";
import SignInWithFarcaster from "@tap/react";

export default function Page() {
  const router = useRouter();

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-start justify-center gap-1 px-4 text-center sm:px-16">
          <h3 className="text-4xl font-semibold dark:text-zinc-50">tap</h3>
          <p className="text-md text-gray-500 dark:text-zinc-400">
            it just takes one <span className="font-semibold">tap</span>
          </p>
          <div className="pt-4">
            <SignInWithFarcaster />
          </div>
        </div>
      </div>
    </div>
  );
}