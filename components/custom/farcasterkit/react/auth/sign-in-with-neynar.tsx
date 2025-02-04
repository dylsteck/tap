"use client";

import { useEffect } from "react";

import { Button } from "../../../../ui/button";

interface SIWNUser {
  username: string;
  display_name: string;
  profile: {
    bio: {
      text: string;
    };
  };
  verifications: string[];
  pfp_url: string;
}

export interface SIWNResponseData {
  fid: string;
  is_authenticated: boolean;
  signer_permissions: string[];
  signer_uuid: string;
  user: SIWNUser;
}

export default function SignInWithNeynar({ handleSignInSuccess }: { handleSignInSuccess: (data: SIWNResponseData) => void }) {
  const neynarClientId = process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID;

  useEffect(() => {
    (window as any).onSignInSuccess = handleSignInSuccess;

    return () => {
      delete (window as any).onSignInSuccess;
    };
  }, [handleSignInSuccess]);

  const initiateSignIn = () => {
    const signInWindow = window.open(
      `https://app.neynar.com/login?client_id=${neynarClientId}`,
      "neynar-signin",
      "width=600,height=700"
    );

    if (signInWindow) {
      const signInListener = (event: MessageEvent) => {
        if (event.origin === "https://app.neynar.com") {
          try {
            const parsedData: SIWNResponseData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            handleSignInSuccess(parsedData);
          } catch (error) {
            console.error("Failed to parse message data:", error);
          }
          window.removeEventListener("message", signInListener);
          signInWindow.close();
        }
      };
      window.addEventListener("message", signInListener);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        initiateSignIn();
      }}
    >
     <Button className="relative rounded-xl">
        sign in with farcaster
      </Button>
    </form>
  );
}