import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

import type { HonoContext, HonoVariables } from '../ctx.js';

type TrpcContext = {
  c: HonoContext;
} & HonoVariables;

const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });

export const router = t.router;
export const publicProcedure = t.procedure;

export const privateProcedure = publicProcedure.use(async ({ ctx, next }) => {
  return next({ ctx });
});