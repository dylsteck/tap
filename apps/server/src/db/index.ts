import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { ChatRepository } from './repositories/chat'
import { UserRepository } from './repositories/user'

const pool = new Pool({
  connectionString: Bun.env.POSTGRES_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err)
  process.exit(-1)
})

export class Repositories {
  public db: ReturnType<typeof drizzle>
  public chat: ChatRepository
  public user: UserRepository

  constructor() {
    this.db = drizzle(pool)
    this.chat = new ChatRepository(this.db)
    this.user = new UserRepository(this.db)
  }
}

export const db = new Repositories()
