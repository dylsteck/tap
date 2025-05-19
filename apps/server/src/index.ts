import { chatRoutes } from './routes/chat';
import { farcasterRoutes } from './routes/farcaster'
import { createElysia } from './lib/utils'
import { clankerRoutes } from './routes/clanker';
import { icebreakerRoutes } from './routes/icebreaker';

const PORT = 3001;

const app = createElysia()
  .group('/v1', app => app
    .use(chatRoutes)
    .use(clankerRoutes)
    .use(farcasterRoutes)
    .use(icebreakerRoutes)
  )

app.listen(PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
