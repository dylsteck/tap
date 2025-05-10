import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import type { HonoContext } from '../ctx.js';
import { router, publicProcedure } from './trpc.js';

export const appRouter = router({
  farcaster: publicProcedure
    .query(() => {
      return { message: "hello farcaster!", status: 200 };
    }),
});

export type AppRouter = typeof appRouter;

export type Inputs = inferRouterInputs<AppRouter>;
export type Outputs = inferRouterOutputs<AppRouter>;

export const serverTrpc = (c: HonoContext) =>
  appRouter.createCaller({ c });
