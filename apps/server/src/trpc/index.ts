import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';

import { farcasterRouter } from './routes/farcaster.js';
import { icebreakerRouter } from './routes/icebreaker.js';
import { router } from './trpc.js';

import type { HonoContext } from '../ctx.js';

export const appRouter = router({
  farcaster: farcasterRouter,
  icebreaker: icebreakerRouter,
});

export type AppRouter = typeof appRouter;

export type Inputs = inferRouterInputs<AppRouter>;
export type Outputs = inferRouterOutputs<AppRouter>;

export const serverTrpc = (c: HonoContext) =>
  appRouter.createCaller({ c });
