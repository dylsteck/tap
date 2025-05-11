import { z } from 'zod';

import { icebreaker } from '../../services/icebreaker.js';
import { router, publicProcedure } from '../trpc.js';

export const icebreakerRouter = router({
  getCredentialProfiles: publicProcedure
    .input(z.object({
      credentialName: z.string(),
      limit: z.string().default('100'),
      offset: z.string().default('3')
    }))
    .query(async ({ input }) => {
      const { credentialName, limit, offset } = input;
      return icebreaker.getCredentialProfiles(credentialName, limit, offset);
    }),

  getProfileByENS: publicProcedure
    .input(
      z.object({
        ensName: z.string()
      })
    )
    .query(async ({ input }) => {
      return icebreaker.getProfileByENS(input.ensName);
    }),

  getProfileByWallet: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ input }) => {
      return icebreaker.getProfileByWallet(input.walletAddress);
    }),

  getProfileByFID: publicProcedure
    .input(z.object({ fid: z.string() }))
    .query(async ({ input }) => {
      return icebreaker.getProfileByFID(input.fid);
    }),

  getProfileByFName: publicProcedure
    .input(z.object({ fname: z.string() }))
    .query(async ({ input }) => {
      return icebreaker.getProfileByFName(input.fname);
    })
}); 