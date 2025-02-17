'use client'

import { Context, sdk, SignIn } from "@farcaster/frame-sdk";
import { FrameSDK } from "@farcaster/frame-sdk/dist/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { login } from "@/app/(auth)/actions";
import { AuthData } from "@/lib/types";

// import { getCsrfToken } from "next-auth/react";

export default function FrameProvider({ children }: { children: React.ReactNode }){
  const router = useRouter(); 
  // const getNonce = useCallback(async () => {
  //     const nonce = await getCsrfToken();
  //     if (!nonce) throw new Error("Unable to generate nonce");
  //     return nonce;
  //   }, []);

    const handleSignIn = useCallback(async (user: Context.FrameContext['user']) => {
      try {
        // note: temporarily commented signIn out because it triggers too much on mobile, will switch back
        // const nonce = await getNonce();
        // const result = await sdk.actions.signIn({ nonce });
        const loginData: AuthData = {
          fid: user.fid.toString(),
          username: user.username || "",
          name: user.displayName || "",
          bio: '',
          verified_address: '',
          signer_uuid: "",
          pfp_url: user.pfpUrl || "",
        };
        await login(loginData);
      } catch (e) {
        if (e instanceof SignIn.RejectedByUser) {
          throw new Error("Rejected by user");
          return;
        }
      }
    // }, [getNonce]);
    }, []);

    useEffect(() => {
        const init = async () => {
          const context = await sdk.context;
          if (context?.client.clientFid) {
            await handleSignIn(context.user);
            router.refresh();
          }
          setTimeout(() => {
            sdk.actions.ready()
          }, 500)
        }
        init()
      }, [handleSignIn, router])

    return(
        <>
         {children}
        </>
    )
}