import cors from '@elysiajs/cors'
import { Elysia } from 'elysia'
import swagger from '@elysiajs/swagger'
import { Logestic } from 'logestic'

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
