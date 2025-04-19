'use client'

import { Context, sdk, SignIn } from "@farcaster/frame-sdk";
import { FrameSDK } from "@farcaster/frame-sdk/dist/types";
import { usePathname, useRouter } from "next/navigation";
import { Session } from "next-auth";
import { getCsrfToken } from "next-auth/react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { login } from "@/app/(auth)/actions";
import { AuthData } from "@/lib/types";

type FrameContextType = Context.FrameContext | null;

const FrameContext = createContext<FrameContextType>(null);

export const useFrameContext = () => useContext(FrameContext);

export default function FrameProvider({ children, session }: { children: React.ReactNode, session?: Session | null }){
  const router = useRouter(); 
  const pathname = usePathname();
  const [frameContext, setFrameContext] = useState<FrameContextType>(null);

  const getNonce = useCallback(async () => {
      const nonce = await getCsrfToken();
      if (!nonce) throw new Error("Unable to generate nonce");
      return nonce;
    }, []);

    const handleSignIn = useCallback(async (user: Context.FrameContext['user']) => {
      try {
        const nonce = await getNonce();
        const result = await sdk.actions.signIn({ nonce });
        const loginData: AuthData = {
          fid: user.fid.toString(),
          username: user.username || "",
          name: user.displayName || "",
          bio: '',
          verified_address: '',
          pfp_url: user.pfpUrl || "",
          message: result.message,
          signature: result.signature,
          csrfToken: nonce
        };
        await login(loginData);
      } catch (e) {
        if (e instanceof SignIn.RejectedByUser) {
          throw new Error("Rejected by user");
          return;
        }
      }
    }, [getNonce]);

    useEffect(() => {
        const init = async () => {
          const context = await sdk.context;
          setFrameContext(context);
          if (context?.client.clientFid && (!session?.user && !session)) {
            await handleSignIn(context.user);
            router.push(pathname);
          }
          setTimeout(() => {
            sdk.actions.ready()
          }, 500)
        }
        init()
      }, [handleSignIn, pathname, router, session])

    return(
        <FrameContext.Provider value={frameContext}>
         {children}
        </FrameContext.Provider>
    )
}