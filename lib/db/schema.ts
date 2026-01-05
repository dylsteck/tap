import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
  walletAddress: varchar("walletAddress", { length: 42 }),
  username: varchar("username", { length: 32 }),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const messageDeprecated = pgTable("Message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
  "Vote",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  "Vote_v2",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  }
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  "Stream",
  {
    id: uuid("id").notNull().defaultRandom(),
    chatId: uuid("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;

// ============================================
// PROJECT / MINIAPP TABLES
// ============================================

export const project = pgTable("Project", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  name: text("name").notNull(),
  description: text("description"),
  subdomain: varchar("subdomain", { length: 63 }).unique(),
  status: varchar("status", {
    enum: ["draft", "building", "deployed", "failed"],
  })
    .notNull()
    .default("draft"),
  deploymentUrl: text("deploymentUrl"),
  thumbnailUrl: text("thumbnailUrl"),
  isPublic: boolean("isPublic").notNull().default(true),
  likesCount: integer("likesCount").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Project = InferSelectModel<typeof project>;

export const projectCode = pgTable("ProjectCode", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  projectId: uuid("projectId")
    .notNull()
    .references(() => project.id),
  files: json("files").notNull(), // { "page.tsx": "...", "globals.css": "..." }
  prompt: text("prompt"),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type ProjectCode = InferSelectModel<typeof projectCode>;

export const apiConnection = pgTable("ApiConnection", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  projectId: uuid("projectId")
    .notNull()
    .references(() => project.id),
  apiName: varchar("apiName", {
    enum: ["neynar", "zapper", "zora", "coingecko", "alchemy"],
  }).notNull(),
  enabled: boolean("enabled").notNull().default(false),
  config: json("config"), // Encrypted user API keys if provided
});

export type ApiConnection = InferSelectModel<typeof apiConnection>;

export const projectLike = pgTable(
  "ProjectLike",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    projectId: uuid("projectId")
      .notNull()
      .references(() => project.id),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.projectId] }),
  })
);

export type ProjectLike = InferSelectModel<typeof projectLike>;

export const projectChatMessage = pgTable("ProjectChatMessage", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  projectId: uuid("projectId")
    .notNull()
    .references(() => project.id),
  role: varchar("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"), // { code?: string, attachments?: any[] }
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type ProjectChatMessage = InferSelectModel<typeof projectChatMessage>;
