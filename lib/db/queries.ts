import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  sql,
  type SQL,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { ArtifactKind } from "@/components/artifact";
import type { VisibilityType } from "@/components/visibility-selector";
import { ChatSDKError } from "../errors";
import { generateUUID } from "../utils";
import {
  type Chat,
  chat,
  type DBMessage,
  document,
  message,
  type Suggestion,
  stream,
  suggestion,
  type User,
  user,
  vote,
  project,
  type Project,
  projectCode,
  type ProjectCode,
  apiConnection,
  type ApiConnection,
  projectLike,
  type ProjectLike,
  projectChatMessage,
  type ProjectChatMessage,
} from "./schema";
import { generateHashedPassword } from "./utils";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<User[]> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get user by email"
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to create user");
  }
}


export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    const userChats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, userId));

    if (userChats.length === 0) {
      return { deletedCount: 0 };
    }

    const chatIds = userChats.map((c) => c.id);

    await db.delete(vote).where(inArray(vote.chatId, chatIds));
    await db.delete(message).where(inArray(message.chatId, chatIds));
    await db.delete(stream).where(inArray(stream.chatId, chatIds));

    const deletedChats = await db
      .delete(chat)
      .where(eq(chat.userId, userId))
      .returning();

    return { deletedCount: deletedChats.length };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id)
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Chat[] = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${startingAfter} not found`
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${endingBefore} not found`
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    if (!selectedChat) {
      return null;
    }

    return selectedChat;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  try {
    return await db.insert(message).values(messages);
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save messages");
  }
}

export async function updateMessage({
  id,
  parts,
}: {
  id: string;
  parts: DBMessage["parts"];
}) {
  try {
    return await db.update(message).set({ parts }).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to update message");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === "up" })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === "up",
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to vote message");
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get votes by chat id"
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save document");
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get documents by id"
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get document by id"
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp)
        )
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete documents by id after timestamp"
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save suggestions"
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(eq(suggestion.documentId, documentId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get suggestions by document id"
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );

    const messageIds = messagesToDelete.map(
      (currentMessage) => currentMessage.id
    );

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds))
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds))
        );
    }
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update chat visibility by id"
    );
  }
}

export async function updateChatTitleById({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  try {
    return await db.update(chat).set({ title }).where(eq(chat.id, chatId));
  } catch (error) {
    console.warn("Failed to update title for chat", chatId, error);
    return;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, "user")
        )
      )
      .execute();

    return stats?.count ?? 0;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message count by user id"
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create stream id"
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get stream ids by chat id"
    );
  }
}

// ============================================
// PROJECT / MINIAPP QUERIES
// ============================================

export async function createProject({
  userId,
  name,
  description,
}: {
  userId: string;
  name: string;
  description?: string;
}) {
  try {
    const [newProject] = await db
      .insert(project)
      .values({
        userId,
        name,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newProject;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to create project");
  }
}

export async function getProjectById({ id }: { id: string }) {
  try {
    const [selectedProject] = await db
      .select()
      .from(project)
      .where(eq(project.id, id));
    return selectedProject || null;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get project by id"
    );
  }
}

export async function getProjectsByUserId({ userId }: { userId: string }) {
  try {
    return await db
      .select()
      .from(project)
      .where(eq(project.userId, userId))
      .orderBy(desc(project.createdAt));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get projects by user id"
    );
  }
}

export async function getPublicProjects({
  limit = 50,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    return await db
      .select({
        project: project,
        user: {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
        },
      })
      .from(project)
      .leftJoin(user, eq(project.userId, user.id))
      .where(and(eq(project.isPublic, true), eq(project.status, "deployed")))
      .orderBy(desc(project.createdAt))
      .limit(limit)
      .offset(offset);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get public projects"
    );
  }
}

export async function updateProject({
  id,
  ...updates
}: {
  id: string;
  name?: string;
  description?: string;
  subdomain?: string;
  status?: "draft" | "building" | "deployed" | "failed";
  deploymentUrl?: string;
  thumbnailUrl?: string;
  isPublic?: boolean;
}) {
  try {
    const [updated] = await db
      .update(project)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(project.id, id))
      .returning();
    return updated;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to update project");
  }
}

export async function deleteProject({ id }: { id: string }) {
  try {
    // Delete related data first
    await db.delete(projectLike).where(eq(projectLike.projectId, id));
    await db.delete(apiConnection).where(eq(apiConnection.projectId, id));
    await db.delete(projectCode).where(eq(projectCode.projectId, id));
    await db.delete(projectChatMessage).where(eq(projectChatMessage.projectId, id));
    
    const [deleted] = await db
      .delete(project)
      .where(eq(project.id, id))
      .returning();
    return deleted;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to delete project");
  }
}

// Project Code queries

export async function saveProjectCode({
  projectId,
  files,
  prompt,
}: {
  projectId: string;
  files: Record<string, string>;
  prompt?: string;
}) {
  try {
    // Get current max version
    const existing = await db
      .select({ version: projectCode.version })
      .from(projectCode)
      .where(eq(projectCode.projectId, projectId))
      .orderBy(desc(projectCode.version))
      .limit(1);

    const nextVersion = existing.length > 0 ? existing[0].version + 1 : 1;

    const [saved] = await db
      .insert(projectCode)
      .values({
        projectId,
        files,
        prompt,
        version: nextVersion,
        createdAt: new Date(),
      })
      .returning();
    return saved;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save project code"
    );
  }
}

export async function getLatestProjectCode({ projectId }: { projectId: string }) {
  try {
    const [latest] = await db
      .select()
      .from(projectCode)
      .where(eq(projectCode.projectId, projectId))
      .orderBy(desc(projectCode.version))
      .limit(1);
    return latest || null;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get latest project code"
    );
  }
}

export async function getProjectCodeHistory({ projectId }: { projectId: string }) {
  try {
    return await db
      .select()
      .from(projectCode)
      .where(eq(projectCode.projectId, projectId))
      .orderBy(desc(projectCode.version));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get project code history"
    );
  }
}

// API Connection queries

export async function getApiConnections({ projectId }: { projectId: string }) {
  try {
    return await db
      .select()
      .from(apiConnection)
      .where(eq(apiConnection.projectId, projectId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get API connections"
    );
  }
}

export async function toggleApiConnection({
  projectId,
  apiName,
  enabled,
}: {
  projectId: string;
  apiName: "neynar" | "zapper" | "zora" | "coingecko" | "alchemy";
  enabled: boolean;
}) {
  try {
    const [existing] = await db
      .select()
      .from(apiConnection)
      .where(
        and(
          eq(apiConnection.projectId, projectId),
          eq(apiConnection.apiName, apiName)
        )
      );

    if (existing) {
      const [updated] = await db
        .update(apiConnection)
        .set({ enabled })
        .where(eq(apiConnection.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(apiConnection)
      .values({ projectId, apiName, enabled })
      .returning();
    return created;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to toggle API connection"
    );
  }
}

// Like queries

export async function toggleProjectLike({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}) {
  try {
    const [existing] = await db
      .select()
      .from(projectLike)
      .where(
        and(
          eq(projectLike.userId, userId),
          eq(projectLike.projectId, projectId)
        )
      );

    if (existing) {
      // Unlike
      await db
        .delete(projectLike)
        .where(
          and(
            eq(projectLike.userId, userId),
            eq(projectLike.projectId, projectId)
          )
        );
      
      // Decrement likes count atomically (don't go below 0)
      await db
        .update(project)
        .set({ likesCount: sql`GREATEST(${project.likesCount} - 1, 0)` })
        .where(eq(project.id, projectId));
      
      return { liked: false };
    }

    // Like
    await db.insert(projectLike).values({
      userId,
      projectId,
      createdAt: new Date(),
    });
    
    // Increment likes count atomically
    await db
      .update(project)
      .set({ likesCount: sql`${project.likesCount} + 1` })
      .where(eq(project.id, projectId));
    
    return { liked: true };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to toggle project like"
    );
  }
}

export async function getUserLikedProjects({ userId }: { userId: string }) {
  try {
    const likes = await db
      .select({ projectId: projectLike.projectId })
      .from(projectLike)
      .where(eq(projectLike.userId, userId));
    
    return likes.map((l) => l.projectId);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get user liked projects"
    );
  }
}

export async function isProjectLikedByUser({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}) {
  try {
    const [existing] = await db
      .select()
      .from(projectLike)
      .where(
        and(
          eq(projectLike.userId, userId),
          eq(projectLike.projectId, projectId)
        )
      );
    return !!existing;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to check if project is liked"
    );
  }
}

// User profile queries

export async function getUserById({ id }: { id: string }) {
  try {
    const [selectedUser] = await db.select().from(user).where(eq(user.id, id));
    return selectedUser || null;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to get user by id");
  }
}

export async function updateUserProfile({
  id,
  username,
  avatarUrl,
  walletAddress,
}: {
  id: string;
  username?: string;
  avatarUrl?: string;
  walletAddress?: string;
}) {
  try {
    const updates: Record<string, string | undefined> = {};
    if (username !== undefined) updates.username = username;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    if (walletAddress !== undefined) updates.walletAddress = walletAddress;

    const [updated] = await db
      .update(user)
      .set(updates)
      .where(eq(user.id, id))
      .returning();
    return updated;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update user profile"
    );
  }
}

// ============================================
// PROJECT CHAT MESSAGE QUERIES
// ============================================

export async function saveProjectChatMessage({
  projectId,
  role,
  content,
  metadata,
}: {
  projectId: string;
  role: "user" | "assistant";
  content: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const [message] = await db
      .insert(projectChatMessage)
      .values({
        projectId,
        role,
        content,
        metadata,
        createdAt: new Date(),
      })
      .returning();
    return message;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save project chat message"
    );
  }
}

export async function getProjectChatMessages({ projectId }: { projectId: string }) {
  try {
    return await db
      .select()
      .from(projectChatMessage)
      .where(eq(projectChatMessage.projectId, projectId))
      .orderBy(asc(projectChatMessage.createdAt));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get project chat messages"
    );
  }
}
