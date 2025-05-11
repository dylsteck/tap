import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'

import { user } from '../schema'

export class UserRepository {
  private db: ReturnType<typeof drizzle>

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db
  }

  async create(params: typeof user.$inferInsert) {
    const [createdUser] = await this.db.insert(user).values(params).returning()
    return createdUser
  }

  async getById(id: string) {
    const [foundUser] = await this.db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1)

    return foundUser || null
  }

  async getByFid(fid: string) {
    const [foundUser] = await this.db
      .select()
      .from(user)
      .where(eq(user.fid, fid))
      .limit(1)

    return foundUser || null
  }

  async getByUsername(username: string) {
    const [foundUser] = await this.db
      .select()
      .from(user)
      .where(eq(user.username, username))
      .limit(1)

    return foundUser || null
  }

  async update(id: string, params: Partial<typeof user.$inferInsert>) {
    const [updatedUser] = await this.db
      .update(user)
      .set(params)
      .where(eq(user.id, id))
      .returning()

    return updatedUser
  }

  async delete(id: string) {
    await this.db.delete(user).where(eq(user.id, id))
  }
} 