import { chatRoutes } from './routes/chat';
import { farcasterRoutes } from './routes/farcaster'
import { createElysia } from './utils'

const PORT = 3001;

const app = createElysia()
  .group('/v1', app => app
    .use(chatRoutes)
    .use(farcasterRoutes)
  )

app.listen(PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
