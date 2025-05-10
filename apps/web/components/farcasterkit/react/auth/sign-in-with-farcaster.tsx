"use client";

import { SignInButton, AuthKitProvider, StatusAPIResponse } from "@farcaster/auth-kit";
import { sdk, SignIn, Context } from "@farcaster/frame-sdk";
import { useRouter } from "next/navigation";
import { getCsrfToken, signIn, signOut } from "next-auth/react";
import { useCallback, useState } from "react";

import "@farcaster/auth-kit/styles.css";

import { useFrameContext } from "@/components/custom/frame-provider";

const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  siweUri: "https://tap.computer",
  domain: "tap.computer",
};

export default function SignInWithFarcaster() {
  return (
    <AuthKitProvider config={config}>
      <Content />
    </AuthKitProvider>
  );
}

function Content(){
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const frameContext = useFrameContext();
  const [isFrameSigningIn, setIsFrameSigningIn] = useState<boolean>(false);

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  const handleSuccess = useCallback(
    (res: StatusAPIResponse) => {
      signIn("credentials", {
        fid: res.fid,
        username: res.username,
        name: res.displayName,
        bio: res.bio,
        verified_address: (res.verifications && res.verifications.length > 0) ? res.verifications[0] : "",
        pfp_url: res.pfpUrl,
        message: res.message,
        signature: res.signature,
        csrfToken: (res as unknown as any).csrfToken as string,
        redirect: false,
      });
      router.refresh();
    },
    [router]
  );

  const handleFrameSignInClick = useCallback(async () => {
    if (!frameContext || !frameContext.user) return;
    setIsFrameSigningIn(true);
    setError(null);
    try {
      const nonce = await getNonce();
      const result = await sdk.actions.signIn({ nonce });
      await signIn("credentials", {
        fid: frameContext.user.fid.toString(),
        username: frameContext.user.username || "",
        name: frameContext.user.displayName || "",
        bio: '',
        verified_address: '',
        pfp_url: frameContext.user.pfpUrl || "",
        message: result.message,
        signature: result.signature,
        csrfToken: nonce,
        redirect: false,
      });
      router.refresh();
    } catch (e) {
      if (e instanceof SignIn.RejectedByUser) {
        setError("Sign in rejected by user in frame.");
      } else {
        console.error("Frame sign in error:", e);
        setError("Frame sign in failed.");
      }
    } finally {
      setIsFrameSigningIn(false);
    }
  }, [frameContext, getNonce, router]);

 return(
  <div>
    {frameContext ? (
      <button 
        onClick={handleFrameSignInClick} 
        disabled={isFrameSigningIn}
        className="relative inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[#8a63d2] text-white shadow hover:bg-[#8a63d2]/90 px-4 py-2"
      >
        {isFrameSigningIn ? "Signing in..." : "Sign in with Farcaster"}
      </button>
    ) : (
      <SignInButton
        nonce={getNonce}
        onSuccess={handleSuccess}
        onError={() => setError("Sign in failed.")}
        onSignOut={() => signOut()}
      />
    )}
    {error && <div style={{ marginTop: '10px', color: 'red' }}>{error}</div>}
  </div>
 )
}