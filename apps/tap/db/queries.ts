"server-only";

import { desc, eq, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { revalidatePath } from "next/cache";
import postgres from "postgres";

import { AuthData } from "@/lib/types";

import { user, chat, User } from "./schema";

let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
let db = drizzle(client);

const USER_BATCH_SIZE = 10;

export async function getUsers(cursor: number = 0): Promise<{ users: Array<User>, hasMore: boolean }> {
  try {
    const limit = USER_BATCH_SIZE;
    const users = await db
      .select()
      .from(user)
      .orderBy(asc(user.id))
      .limit(limit)
      .offset(cursor * limit);

    const hasMore = users.length === limit;

    return { users, hasMore };
  } catch (error) {
    console.error("Failed to get users from database");
    throw error;
  }
}

export async function getUserById(id: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.id, id));
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export async function getUserByFid(fid: number): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.fid, `${fid}`));
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export async function createUser(userData: AuthData) {
  try {
    return await db.insert(user).values(userData);
  } catch (error) {
    console.error("Failed to create user in database", error);
    throw error;
  }
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: any;
  userId: string;
}) {
  try {
    const selectedChats = await db.select().from(chat).where(eq(chat.id, id));

    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({
          messages: JSON.stringify(messages),
        })
        .where(eq(chat.id, id));
    }

    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      messages: JSON.stringify(messages),
      profile: "default",
      userId,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function deleteChatsByUserId({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.userId, id));
  } catch (error) {
    console.error("Failed to delete chats by user id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}
