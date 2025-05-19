import cors from '@elysiajs/cors'
import { Elysia } from 'elysia'
import swagger from '@elysiajs/swagger'
import { Logestic } from 'logestic'

// Add BASE_URL and CAST_HASH_LENGTH
export const BASE_URL = 'https://api.tap.computer'
export const CAST_HASH_LENGTH = 66 // Standard Ethereum hash length (0x + 64 hex chars)

export const createElysia = (config?: ConstructorParameters<typeof Elysia>[0]) =>
  new Elysia(config)
    .use(cors())
    .use(Logestic.preset('common'))
    .use(swagger())
    .onError(({ server, error, path }) => {
      console.error(path, error)
      if (error.message.toLowerCase().includes('out of memory')) {
        server?.stop()
        process.exit(1)
      }
    })
