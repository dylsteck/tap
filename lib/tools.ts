import { tool, ToolSet } from "ai"
import { z } from "zod"

import { BaseIcon, BountycasterIcon, ClankerIcon, FarcasterIcon, IcebreakerIcon } from "@/components/custom/icons";

import { BASE_URL, CAST_HASH_LENGTH, tapSDK } from "./utils"

export const profiles = [
  {
    id: 'farcaster',
    name: 'Farcaster',
    description: 'A social protocol',
    icon: FarcasterIcon,
    tools: {
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
      askNeynarDocs: tool({
        description: 'Ask a question to Neynar\'s AI assistant for insights on how to use Neynar to build on top of Farcaster. The assistant can also answer general questions about building on Farcaster',
        parameters: z.object({
          question: z.string(),
        }),
        execute: async ({ question }) => {
          try {
            return await tapSDK.askNeynarDocs(question);
          } catch (error) {
            console.error('Error in askNeynarDocs tool:', error);
            return `Error querying Neynar: ${(error as Error).message}`;
          }
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
      getFarcasterApp: tool({
        description: `Gets information on a Farcaster ecosystem app given its name`,
        parameters: z.object({
          name: z.string()
        }),
        execute: async ({ name }) => {
          const appData = await tapSDK.getFarcasterApp(name);
          if(appData.length === 0){
            throw new Error(`No Farcaster apps found for name: ${name}`);
          }
          return appData[0];
        },
      }),
      getFarcasterApps: tool({
        description: `Gets information on Farcaster apps. Use the cursor to find more apps in the database and if you see "hasMore: false" in the response then there are not going to be additional apps to query for.`,
        parameters: z.object({
          cursor: z.number().optional()
        }),
        execute: async ({ cursor }) => {
          const appsData = await tapSDK.getFarcasterApps(cursor ?? 0);
          if(appsData.length === 0){
            throw new Error("No Farcaster apps found");
          }
          return appsData;
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
      })
    }
  },
  {
    id: 'bountycaster',
    name: 'Bountycaster',
    description: 'A bounties platform',
    icon: BountycasterIcon,
    tools: {
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
      })
    }
  },
  {
    id: 'clanker',
    name: 'Clanker',
    description: 'A token launchpad',
    icon: ClankerIcon,
    tools: {
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
          const tokenData = await tapSDK.getEthToken(searchItem.contract_address, 'BASE_MAINNET', 'WEEK');
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
      })
    }
  },
  {
    id: 'icebreaker',
    name: 'Icebreaker',
    description: 'The open professional network',
    icon: IcebreakerIcon,
    tools: {
      getIcebreakerCredentialProfiles: tool({
        description: 'Gets Icebreaker credential profiles based on the credential name.',
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
      }),
    }
  },
  {
    id: 'base',
    name: 'Base',
    description: 'Query and act on Base',
    icon: BaseIcon,
    tools: {
      fundEth: tool({
        description: 'Prompts the user to be able to purchase some Ethereum via Coinbase',
        parameters: z.object({}),
        execute: async ({ }) => {
          return true;
        },
      }),
    }
  }
]

export const tools = () => {
  const allTools = profiles.reduce((acc, profile) => {
    return { ...acc, ...profile.tools };
  }, {});
  return allTools as ToolSet;
}
