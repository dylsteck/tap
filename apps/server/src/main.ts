import { serve } from '@hono/node-server';
import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { appRouter } from './trpc/index.js';

import type { HonoContext, HonoVariables, AppEnv } from './ctx.js';


const api = new Hono<{ Variables: HonoVariables; Bindings: AppEnv }>()
  .use(
    '*',
    cors({
      origin: '*',
      credentials: true,
      allowHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .use('*', async (c, next) => {
    await next();
  })
  .use(
    trpcServer({
      endpoint: '/api/trpc',
      router: appRouter,
      createContext: (_, c) => ({ c }),
      allowMethodOverride: true,
      onError: (opts) => {
        console.error('Error in TRPC handler:', opts.error);
      },
    }),
  )
  .onError(async (err, c) => {
    if (err instanceof Response) return err;
    console.error('Error in Hono handler:', err);
    return c.json(
      {
        error: 'Internal Server Error',
        message: err instanceof Error ? err.message : 'Unknown error',
      },
      500,
    );
  });

const app = new Hono<{ Variables: HonoVariables; Bindings: AppEnv }>()
  .route('/api', api)
  .get('/health', (c) => c.json({ message: 'Hello World!' }));

const port = 3000;
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port: port
})
