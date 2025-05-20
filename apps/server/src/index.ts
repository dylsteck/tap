import { chatRoutes } from './routes/chat';
import { farcasterRoutes } from './routes/farcaster'
import { createElysia } from './lib/utils'
import { clankerRoutes } from './routes/clanker';
import { icebreakerRoutes } from './routes/icebreaker';
import { userRoutes } from './routes/user';

const PORT = 3001;

const app = createElysia()
  .group('/v1', app => app
    .use(chatRoutes)
    .use(clankerRoutes)
    .use(farcasterRoutes)
    .use(icebreakerRoutes)
    .use(userRoutes)
  )

app.listen(PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
