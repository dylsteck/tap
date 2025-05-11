import 'dotenv/config'

import { drizzle } from 'drizzle-orm/node-postgres'

import { ChatRepository } from './repositories/chat'
import { UserRepository } from './repositories/user'

export class Repositories {
  public db: ReturnType<typeof drizzle>

  public chat: ChatRepository
  public user: UserRepository

  constructor() {
    this.db = drizzle(process.env.DATABASE_URL as string)
    this.chat = new ChatRepository(this.db)
    this.user = new UserRepository(this.db)
  }
}

export const db = new Repositories()
