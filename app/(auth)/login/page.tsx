"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import SignInWithNeynar, { SIWNResponseData } from "@/components/farcasterkit/react/auth/sign-in-with-neynar";
import { AuthData } from "@/lib/types";

import { login } from "../actions";


export default function Page() {
  const router = useRouter();

  const handleSubmit = async (siwnData: SIWNResponseData) => {
    try {
      const loginData: AuthData = {
        fid: siwnData.fid,
        username: siwnData.user.username,
        name: siwnData.user.display_name,
        bio: siwnData.user.profile.bio.text,
        verified_address: siwnData.user.verifications[0],
        signer_uuid: siwnData.signer_uuid,
        pfp_url: siwnData.user.pfp_url
      };
      const result = await login(loginData);
      if (result.status === "failed") {
        toast.error("Invalid credentials!");
      } else if (result.status === "invalid_data") {
        toast.error("Failed validating your submission!");
      } else if (result.status === "success") {
        router.refresh();
      }
      return result;
    } catch (error) {
      toast.error("An unexpected error occurred");
      return { status: "failed" };
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-start justify-center gap-1 px-4 text-center sm:px-16">
          <h3 className="text-4xl font-semibold dark:text-zinc-50">tap</h3>
          <p className="text-md text-gray-500 dark:text-zinc-400">
            it just takes one <span className="font-semibold">tap</span>
          </p>
          <div className="pt-4">
            <SignInWithNeynar handleSignInSuccess={(siwnData) => handleSubmit(siwnData)} />
          </div>
        </div>
      </div>
    </div>
  );
}