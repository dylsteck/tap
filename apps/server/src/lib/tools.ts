import { tool, ToolSet } from "ai"
import { z } from "zod"
import { tapSDK } from "@tap/common"
import { BASE_URL } from "./utils"

export const tools: ToolSet = {
  analyzeCast: tool({
    description: 'Retrieve and analyze/explain details of a specific cast by its hash or Warpcast URL.',
    parameters: z.object({
      input: z.string(),
    }),
    execute: async ({ input }) => {
      const warpcastHashRegex = /^(https?:\/\/)?(warpcast\.com|supercast\.xyz|casterscan\.com|recaster\.org)\/.*?(0x[0-9a-fA-F]+)/;
      const hashRegex = /^0x[0-9a-fA-F]+$/;
      
      let matchValue = input;
      let matchType = 'hash';

      const urlMatch = input.match(warpcastHashRegex);
      if (urlMatch) {
        matchValue = input.startsWith('http') ? input : `https://${input}`;
        matchType = 'url';
      } else if (hashRegex.test(input)) {
        matchType = 'hash';
        matchValue = input;
      }

      const castData = await tapSDK.getCast(matchType, matchValue);
      return castData.cast;
    },
  }),
  castSearch: tool({
    description: 'Search over content(posts, casts as Farcaster calls them) on Farcaster per a given query.',
    parameters: z.object({
      query: z.string(),
    }),
    execute: async ({ query }) => {
      const castSearchData = await tapSDK.castSearch(query)
      return castSearchData.result.casts
    },
  }),
  getChannelsCasts: tool({
    description: 'Get casts from specific Farcaster channels.',
    parameters: z.object({
      channel_ids: z.string(),
      with_recasts: z.boolean().optional(),
      viewer_fid: z.number().optional(),
      with_replies: z.boolean().optional(),
      members_only: z.boolean().optional(),
      limit: z.number().optional(),
      cursor: z.string().optional(),
    }),
    execute: async ({ 
      channel_ids, 
      with_recasts, 
      viewer_fid, 
      with_replies, 
      members_only, 
      limit, 
      cursor 
    }) => {
      const channelCasts = await tapSDK.getChannelsCasts({
        channel_ids, 
        with_recasts, 
        viewer_fid, 
        with_replies, 
        members_only, 
        limit, 
        cursor
      });
      return channelCasts.casts;
    },
  }),
  getEvents: tool({
    description: `Get upcoming Farcaster events on Events.xyz. Do not show any images in your response and try to model your response into this format below:
    
    Here are some upcoming events:
    • [Event Name] at [Event Time] hosted by [Event Hosts]: [Link](https://events.xyz/events/[Event ID])

    [One to two sentence overview of the events given the context]`,
    parameters: z.object({}),
    execute: async ({}) => {
      const eventsData = await tapSDK.getEvents();
      return eventsData;
    },
  }),
  getUserCasts: tool({
    description: 'Gets the latest casts per a particular username on Farcaster.',
    parameters: z.object({
        username: z.string(),
    }),
    execute: async ({ username }) => {
        const user = await tapSDK.getFarcasterUser(username);
        if(!user){
            throw new Error('User data not available');
        }
        const userCastsData = await tapSDK.getFarcasterUserCasts(user.fid);
        return userCastsData.casts;
    },
  }),
  getTrendingCasts: tool({
    description: 'Get trending casts (posts) from Farcaster.',
    parameters: z.object({}),
    execute: async ({}) => {
      const trendingCasts = await tapSDK.getTrendingCasts()
      return trendingCasts.casts
    },
  }),
  getBounties: tool({
    description: 'Get Farcaster bounties with optional status and time filtering. Include the link to each bounty *on Bountcaster*, not on Farcaster/Warpcast, in your response.',
    parameters: z.object({
      status: z.string().optional(),
      timeFrame: z.string().optional(),
    }),
    execute: async ({ status, timeFrame }) => {
      let eventsSince: string | undefined;
      
      if (timeFrame) {
        const now = new Date(Date.now());
        const lowerInput = timeFrame.toLowerCase();
        let date = new Date(now);

        if (lowerInput.includes('month')) {
          date.setMonth(date.getMonth() - 1);
        } else if (lowerInput.includes('week')) {
          date.setDate(date.getDate() - 7);
        } else if (lowerInput.includes('day')) {
          date.setDate(date.getDate() - 1);
        } else if (lowerInput.includes('hour')) {
          date.setHours(date.getHours() - 1);
        } else {
          try {
            date = new Date(timeFrame);
          } catch {
            date = now;
          }
        }
        eventsSince = date.toISOString();
      }
      const res = await tapSDK.getBounties(status, eventsSince);
      return res.bounties;
    },
  }),
  getClanker: tool({
    description: 'Gets information about a particular Clanker token based on a search string.',
    parameters: z.object({
      text: z.string(),
    }),
    execute: async ({ text }) => {
      const searchResults = await tapSDK.clankerSearch(text);
      const searchItem = searchResults.data.find((item: any) => 
        item.name.toLowerCase() === text.toLowerCase()
      );
      if (!searchItem) {
        throw new Error('No Clanker found for the given text');
      }
      const tokenData = await tapSDK.getEthToken((searchItem as any).contract_address, 'BASE_MAINNET', 'WEEK');
      return tokenData.data.fungibleToken;
    },
  }),
  getTrendingClankers: tool({
    description: 'Gets information about trending Clanker tokens',
    parameters: z.object({}),
    execute: async ({}) => {
      const trendingTokenData = await tapSDK.getTrendingClankers();
      return trendingTokenData;
    },
  }),
  getIcebreakerCredentials: tool({
    description: 'Returns a list of all Icebreaker credentials that users are able to query by',
    parameters: z.object({}),
    execute: async({ }) => {
      return { credentials: tapSDK.getIcebreakerCredentials() };
    }
  }),
  getIcebreakerCredentialProfiles: tool({
    description: 'Gets Icebreaker credential profiles based on the credential name. Please note that some of the credentials are called `Skill: [Skill name]`, such as `Skill: Engineering`. Do not show images in your response and show as many links inline as you can.',
    parameters: z.object({
      credentialName: z.string(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }),
    execute: async ({ credentialName, limit, offset }) => {
      return await tapSDK.getIcebreakerCredentialProfiles(credentialName, limit, offset);
    },
  }),
  getIcebreakerEnsProfile: tool({
    description: 'Gets Icebreaker profile based on ENS name.',
    parameters: z.object({
      ensName: z.string(),
    }),
    execute: async ({ ensName }) => {
      return await tapSDK.getIcebreakerEnsProfile(ensName);
    },
  }),
  getIcebreakerEthAddressProfile: tool({
    description: 'Gets Icebreaker profile based on Ethereum wallet address.',
    parameters: z.object({
      walletAddress: z.string(),
    }),
    execute: async ({ walletAddress }) => {
      return await tapSDK.getIcebreakerEthAddressProfile(walletAddress);
    },
  }),
  getIcebreakerEthProfile: tool({
    description: 'Gets Icebreaker profile based on either ENS name or Ethereum address.',
    parameters: z.object({
      identifier: z.string(),
    }),
    execute: async ({ identifier }) => {
      return await tapSDK.getIcebreakerEthProfile(identifier);
    },
  }),
  getIcebreakerFCUser: tool({
    description: 'Gets Icebreaker user profile based on first name.',
    parameters: z.object({
      fname: z.string(),
    }),
    execute: async ({ fname }) => {
      return await tapSDK.getIcebreakerFCUser(fname);
    },
  }),
  getIcebreakerFidProfile: tool({
    description: 'Gets Icebreaker profile based on FID.',
    parameters: z.object({
      fid: z.number(),
    }),
    execute: async ({ fid }) => {
      return await tapSDK.getIcebreakerFidProfile(fid);
    },
  }),
  getIcebreakerFnameProfile: tool({
    description: 'Gets Icebreaker profile based on first name.',
    parameters: z.object({
      fname: z.string(),
    }),
    execute: async ({ fname }) => {
      return await tapSDK.getIcebreakerFnameProfile(fname);
    },
  }),
  getIcebreakerProfile: tool({
    description: 'Gets Icebreaker profile based on first name or FID.',
    parameters: z.object({
      fname: z.string().optional(),
      fid: z.string().optional(),
    }),
    execute: async ({ fname, fid }) => {
      return await tapSDK.getIcebreakerProfile(fname, fid);
    },
  })
};
