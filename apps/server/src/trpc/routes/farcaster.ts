import { router, publicProcedure } from '../trpc.js';

export const farcasterRouter = router({
  hello: publicProcedure
    .query(() => {
      return { message: "hello farcaster!", status: 200 };
    })
}); 