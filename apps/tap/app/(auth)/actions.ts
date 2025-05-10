"use server";

import { z } from "zod";

import { createUser, getUserByFid } from "@/db/queries";
import { AuthData } from "@/lib/types";

import { signIn } from "./auth";

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
    let [user] = await getUserByFid(parseInt(authData.fid));
    if (!user) {
      await createUser(authData);
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