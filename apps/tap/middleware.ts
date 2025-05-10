import NextAuth from "next-auth";

import { authConfig } from "@/app/(auth)/auth.config";

import type { NextAuthResult } from "next-auth";

export default NextAuth(authConfig).auth as NextAuthResult["auth"];

export const config = {
  matcher: ["/", "/chat", "/chat/:id"]
};
