"use server";

import { z } from "zod";

import { AuthData } from "@/lib/types";

import { signIn } from "./auth";
import { tapSDK } from "@tap/common";

export interface ActionState {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
}

export const login = async (authData: AuthData): Promise<ActionState> => {
  try {
    const userResponse = await tapSDK.getUserByFid(authData.fid.toString());
    const user = userResponse.success ? userResponse.data : null;
    
    if (!user) {
      await tapSDK.createUser({
        id: authData.fid.toString(),
        fid: authData.fid.toString(),
        username: authData.username,
        name: authData.name,
        pfp_url: authData.pfp_url
      });
    }

    const signInResult = await signIn("credentials", {
      ...authData,
      redirect: false
    });

    if (signInResult?.error) {
      return { status: "failed" };
    }

    return { status: "success" };
  } catch (error) {
    console.error("Login error:", error);
    return { status: "failed" };
  }
};