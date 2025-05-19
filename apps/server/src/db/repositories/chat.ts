import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'

import { chat, user } from '../schema'

export class ChatRepository {
  private db: ReturnType<typeof drizzle>

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db
  }

  async create(params: typeof chat.$inferInsert) {
    const [createdChat] = await this.db.insert(chat).values(params).returning()
    return createdChat
  }

  async getById(id: string) {
    const [foundChat] = await this.db
      .select()
      .from(chat)
      .where(eq(chat.id, id))
      .limit(1)

    return foundChat || null
  }

  async getByUserId(userId: string) {
    const chats = await this.db
      .select()
      .from(chat)
      .where(eq(chat.userId, userId))
      .orderBy(chat.createdAt)

    return chats
  }

  async update(id: string, params: Partial<Omit<typeof chat.$inferInsert, 'id'>>) {
    const [updatedChat] = await this.db
      .update(chat)
      .set(params)
      .where(eq(chat.id, id))
      .returning()

    return updatedChat
  }

  async delete(id: string) {
    await this.db.delete(chat).where(eq(chat.id, id))
  }

  async deleteByUserId(userId: string) {
    await this.db.delete(chat).where(eq(chat.userId, userId))
  }
} 