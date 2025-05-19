import { Message } from "ai";
import { InferSelectModel } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  fid: varchar("fid", { length: 64 }),
  username: varchar("username", { length: 64 }),
  name: varchar("name", { length: 64 }),
  bio: varchar("bio", { length: 256 }),
  verified_address: varchar("verified_address", { length: 256 }),
  pfp_url: varchar("pfp_url", { length: 256 }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  messages: json("messages").notNull(),
  profile: text("profile").notNull().default('farcaster'),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});
export type Chat = Omit<InferSelectModel<typeof chat>, "messages"> & {
  messages: Array<Message>;
};

