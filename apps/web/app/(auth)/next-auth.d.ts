import type { NextApiRequest, NextApiResponse } from "next";
import type { Session, User } from "next-auth";

declare module "next-auth" {
  interface NextAuthRequest extends Request {}
  interface AppRouteHandlerFnContext {
    params?: Record<string, string | string[]>;
  }
  interface GetServerSidePropsContext {
    req: NextApiRequest;
    res: NextApiResponse;
  }

  export type GetAuthReturn = Promise<Session | null>;

  export interface GetAuth {
    (): GetAuthReturn;
    (ctx: GetServerSidePropsContext): GetAuthReturn;
    (req: NextApiRequest, res: NextApiResponse): GetAuthReturn;
    (options: { req: NextAuthRequest; ctx?: AppRouteHandlerFnContext }): GetAuthReturn;
  }

  export interface NextAuthResult {
    handlers: { GET: Function; POST: Function };
    auth: GetAuth;
    signIn: Function;
    signOut: Function;
  }

  export function NextAuth(config: any): NextAuthResult;
}

declare module "../../../../node_modules/next-auth/lib" {
  export const auth: import("next-auth").GetAuth;
}

declare module "../../../../node_modules/next-auth/lib/types" {
  export const auth: import("next-auth").GetAuth;
} 