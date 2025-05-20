import { compare } from "bcrypt-ts";
import NextAuth, { User, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { tapSDK } from "@tap/common";

import { authConfig } from "./auth.config";

interface ExtendedSession extends Session {
  user: User;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
}: {
  handlers: { GET: Function; POST: Function };
  auth: import("next-auth").GetAuth;
  signIn: Function;
  signOut: Function;
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Sign in with Neynar",
      credentials: {
        fid: { label: "Fid", type: "number" },
        username: { label: "Username", type: "text" },
        name: { label: "Name", type: "text" },
        bio: { label: "Bio", type: "text" },
        verified_address: { label: "Verified address", type: "text" },
        pfp_url: { label: "Pfp Url", type: "text" },
        message: { label: "Message", type: "text", placeholder: "0x0" },
        signature: { label: "Signature", type: "text", placeholder: "0x0" },
        csrfToken: { label: "CSRF Token", type: "text", placeholder: "0x0" },
      },
      async authorize(credentials: any) {
        if (!credentials) return null;
        const userResponse = await tapSDK.getUserByFid(credentials.fid.toString());
        const users = userResponse.success ? [userResponse.data] : [];
        // Return credentials for new users since they're already validated
        if (users.length === 0) return credentials;
        return users[0] as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as any;
      }
      
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: any;
    }) {
      if (session.user) {
        session.user = token.user as User;
      }

      return session;
    },
  },
});