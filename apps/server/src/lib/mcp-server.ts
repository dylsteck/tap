import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { neynar } from '../services/neynar';
import { warpcast } from '../services/warpcast';
import { clanker } from '../services/clanker';
import { icebreaker } from '../services/icebreaker';
import { redis } from './redis';

export class TapMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'tap-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Farcaster tools
          {
            name: 'farcaster_get_user',
            description: 'Get Farcaster user information by username or FID',
            inputSchema: {
              type: 'object',
              properties: {
                username: { type: 'string', description: 'Username to lookup' },
                fid: { type: 'string', description: 'FID to lookup' },
              },
              oneOf: [
                { required: ['username'] },
                { required: ['fid'] }
              ]
            },
          },
          {
            name: 'farcaster_get_user_casts',
            description: 'Get casts from a specific Farcaster user',
            inputSchema: {
              type: 'object',
              properties: {
                fid: { type: 'string', description: 'User FID' },
                viewer_fid: { type: 'string', description: 'Viewer FID (optional)' },
                limit: { type: 'string', description: 'Number of casts to return (default: 25)' },
                cursor: { type: 'string', description: 'Pagination cursor' },
                include_replies: { type: 'string', description: 'Include replies (default: true)' },
                parent_url: { type: 'string', description: 'Filter by parent URL' },
                channel_id: { type: 'string', description: 'Filter by channel ID' },
              },
              required: ['fid'],
            },
          },
          {
            name: 'farcaster_search_casts',
            description: 'Search Farcaster casts',
            inputSchema: {
              type: 'object',
              properties: {
                q: { type: 'string', description: 'Search query' },
                author_fid: { type: 'string', description: 'Filter by author FID' },
                limit: { type: 'string', description: 'Number of results to return' },
                cursor: { type: 'string', description: 'Pagination cursor' },
              },
              required: ['q'],
            },
          },
          {
            name: 'farcaster_get_trending',
            description: 'Get trending Farcaster casts',
            inputSchema: {
              type: 'object',
              properties: {
                limit: { type: 'string', description: 'Number of casts to return' },
                cursor: { type: 'string', description: 'Pagination cursor' },
                time_window: { 
                  type: 'string', 
                  enum: ['1h', '6h', '24h', '7d'],
                  description: 'Time window for trending' 
                },
                channel_id: { type: 'string', description: 'Filter by channel ID' },
              },
            },
          },
          {
            name: 'farcaster_get_channels_feed',
            description: 'Get feed from specific Farcaster channels',
            inputSchema: {
              type: 'object',
              properties: {
                channel_ids: { type: 'string', description: 'Comma-separated channel IDs' },
                with_recasts: { type: 'string', description: 'Include recasts' },
                viewer_fid: { type: 'string', description: 'Viewer FID' },
                with_replies: { type: 'string', description: 'Include replies' },
                members_only: { type: 'string', description: 'Members only' },
                fids: { type: 'string', description: 'Filter by FIDs' },
                limit: { type: 'string', description: 'Number of casts to return' },
                cursor: { type: 'string', description: 'Pagination cursor' },
              },
              required: ['channel_ids'],
            },
          },
          {
            name: 'farcaster_get_cast',
            description: 'Get a specific Farcaster cast by hash or URL',
            inputSchema: {
              type: 'object',
              properties: {
                identifier: { type: 'string', description: 'Cast hash or URL' },
                type: { 
                  type: 'string', 
                  enum: ['hash', 'url'],
                  description: 'Type of identifier (default: hash)' 
                },
              },
              required: ['identifier'],
            },
          },
          // Clanker tools
          {
            name: 'clanker_get_by_address',
            description: 'Get Clanker token information by address',
            inputSchema: {
              type: 'object',
              properties: {
                address: { type: 'string', description: 'Token contract address' },
                limit: { type: 'string', description: 'Number of results to return (default: 25)' },
                cursor: { type: 'string', description: 'Pagination cursor' },
              },
              required: ['address'],
            },
          },
          {
            name: 'clanker_search',
            description: 'Search Clanker tokens',
            inputSchema: {
              type: 'object',
              properties: {
                q: { type: 'string', description: 'Search query' },
                limit: { type: 'string', description: 'Number of results to return (default: 25)' },
                cursor: { type: 'string', description: 'Pagination cursor' },
              },
              required: ['q'],
            },
          },
          {
            name: 'clanker_get_trending',
            description: 'Get trending Clanker tokens',
            inputSchema: {
              type: 'object',
              properties: {
                limit: { type: 'string', description: 'Number of tokens to return (default: 25)' },
                cursor: { type: 'string', description: 'Pagination cursor' },
                time_window: { 
                  type: 'string', 
                  enum: ['1h', '6h', '24h', '7d'],
                  description: 'Time window for trending (default: 24h)' 
                },
              },
            },
          },
          // Icebreaker tools
          {
            name: 'icebreaker_get_by_ens',
            description: 'Get Icebreaker profile by ENS name',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'ENS name' },
              },
              required: ['name'],
            },
          },
          {
            name: 'icebreaker_get_by_eth',
            description: 'Get Icebreaker profile by Ethereum address',
            inputSchema: {
              type: 'object',
              properties: {
                address: { type: 'string', description: 'Ethereum address' },
              },
              required: ['address'],
            },
          },
          {
            name: 'icebreaker_get_by_fid',
            description: 'Get Icebreaker profile by Farcaster FID',
            inputSchema: {
              type: 'object',
              properties: {
                fid: { type: 'string', description: 'Farcaster FID' },
              },
              required: ['fid'],
            },
          },
          {
            name: 'icebreaker_get_by_fname',
            description: 'Get Icebreaker profile by Farcaster username',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Farcaster username' },
              },
              required: ['name'],
            },
          },
          {
            name: 'icebreaker_get_credentials',
            description: 'Get Icebreaker profiles by credential name',
            inputSchema: {
              type: 'object',
              properties: {
                credentialName: { type: 'string', description: 'Credential name' },
                limit: { type: 'string', description: 'Number of results to return (default: 100)' },
                offset: { type: 'string', description: 'Offset for pagination (default: 0)' },
              },
              required: ['credentialName'],
            },
          },
          {
            name: 'icebreaker_get_by_social',
            description: 'Get Icebreaker profile by social media handle',
            inputSchema: {
              type: 'object',
              properties: {
                channelType: { type: 'string', description: 'Social media platform' },
                username: { type: 'string', description: 'Username on the platform' },
              },
              required: ['channelType', 'username'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Farcaster tools
          case 'farcaster_get_user':
            return await this.handleFarcasterGetUser(args);
          case 'farcaster_get_user_casts':
            return await this.handleFarcasterGetUserCasts(args);
          case 'farcaster_search_casts':
            return await this.handleFarcasterSearchCasts(args);
          case 'farcaster_get_trending':
            return await this.handleFarcasterGetTrending(args);
          case 'farcaster_get_channels_feed':
            return await this.handleFarcasterGetChannelsFeed(args);
          case 'farcaster_get_cast':
            return await this.handleFarcasterGetCast(args);
          // Clanker tools
          case 'clanker_get_by_address':
            return await this.handleClankerGetByAddress(args);
          case 'clanker_search':
            return await this.handleClankerSearch(args);
          case 'clanker_get_trending':
            return await this.handleClankerGetTrending(args);
          // Icebreaker tools
          case 'icebreaker_get_by_ens':
            return await this.handleIcebreakerGetByEns(args);
          case 'icebreaker_get_by_eth':
            return await this.handleIcebreakerGetByEth(args);
          case 'icebreaker_get_by_fid':
            return await this.handleIcebreakerGetByFid(args);
          case 'icebreaker_get_by_fname':
            return await this.handleIcebreakerGetByFname(args);
          case 'icebreaker_get_credentials':
            return await this.handleIcebreakerGetCredentials(args);
          case 'icebreaker_get_by_social':
            return await this.handleIcebreakerGetBySocial(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  // Farcaster handlers
  private async handleFarcasterGetUser(args: any) {
    const { username, fid } = args;
    const cacheKey = username ? `user:${username}` : fid ? `user:${fid}` : null;
    
    if (!cacheKey) {
      throw new Error('Username or FID parameter is required');
    }
    
    let data = await redis.get(cacheKey);

    if (data === null) {
      if (username) {
        data = await warpcast.getUserByUsername(username);
      } else if (fid) {
        data = await warpcast.getUserByFid(fid);
      }
      
      if (data) {
        await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 });
      }
    } else if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleFarcasterGetUserCasts(args: any) {
    const { fid, viewer_fid, limit = '25', cursor, include_replies = 'true', parent_url, channel_id } = args;
    
    const cacheKey = `user_casts:${fid}:${viewer_fid || ''}:${limit}:${cursor || ''}:${include_replies}:${parent_url || ''}:${channel_id || ''}`;
    let data = await redis.get(cacheKey);
    
    if (data === null) {
      data = await neynar.getUserCasts({
        fid: parseInt(fid),
        viewer_fid: viewer_fid ? parseInt(viewer_fid) : undefined,
        limit: parseInt(limit),
        cursor: cursor ? String(cursor) : undefined,
        include_replies: include_replies !== 'false',
        parent_url: parent_url ? String(parent_url) : undefined,
        channel_id: channel_id ? String(channel_id) : undefined
      });
      
      await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 });
    } else if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleFarcasterSearchCasts(args: any) {
    const { q, author_fid, limit, cursor } = args;
    
    const cacheKey = `search:${q}:${author_fid || ''}:${limit || ''}:${cursor || ''}`;
    let data = await redis.get(cacheKey);
    
    if (data === null) {
      const params: any = { q };
      
      if (author_fid) params.author_fid = Number(author_fid);
      if (limit) params.limit = Number(limit);
      if (cursor) params.cursor = cursor;
      
      data = await neynar.castSearch(params);
      await redis.set(cacheKey, JSON.stringify(data), { ex: 600 });
    } else if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleFarcasterGetTrending(args: any) {
    const { limit, cursor, time_window, channel_id } = args;
    
    const cacheKey = `trending:${limit || ''}:${time_window || ''}:${channel_id || ''}:${cursor || ''}`;
    let data = await redis.get(cacheKey);
    
    if (data === null) {
      const params: any = {};
      
      if (limit) params.limit = Number(limit);
      if (cursor) params.cursor = cursor;
      if (time_window) params.time_window = time_window;
      if (channel_id) params.channel_id = channel_id;
      
      data = await neynar.getTrendingCasts(params);
      await redis.set(cacheKey, JSON.stringify(data), { ex: 1800 });
    } else if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleFarcasterGetChannelsFeed(args: any) {
    const { channel_ids, with_recasts, viewer_fid, with_replies, members_only, fids, limit, cursor } = args;
    
    const cacheKey = `channels:${channel_ids}:${with_recasts || ''}:${with_replies || ''}:${members_only || ''}:${fids || ''}:${limit || ''}:${cursor || ''}`;
    let data = await redis.get(cacheKey);
    
    if (data === null) {
      const params: any = { channel_ids: String(channel_ids) };
      
      if (with_recasts !== undefined) params.with_recasts = with_recasts === 'true';
      if (viewer_fid) params.viewer_fid = Number(viewer_fid);
      if (with_replies !== undefined) params.with_replies = with_replies === 'true';
      if (members_only !== undefined) params.members_only = members_only === 'true';
      if (fids) params.fids = String(fids);
      if (limit) params.limit = Number(limit);
      if (cursor) params.cursor = cursor;
      
      data = await neynar.getChannelsFeed(params);
      await redis.set(cacheKey, JSON.stringify(data), { ex: 1800 });
    } else if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleFarcasterGetCast(args: any) {
    const { identifier, type = 'hash' } = args;
    
    const cacheKey = `cast:${identifier}:${type}`;
    let data = await redis.get(cacheKey);
    
    if (data === null) {
      data = await neynar.getCast({ 
        identifier: String(identifier), 
        type: type as 'hash' | 'url'
      });
      await redis.set(cacheKey, JSON.stringify(data), { ex: 43200 });
    } else if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  // Clanker handlers
  private async handleClankerGetByAddress(args: any) {
    const { address, limit = '25', cursor } = args;
    
    const cacheKey = `clanker_address:${address}:${limit}:${cursor || ''}`;
    let data = await redis.get(cacheKey);
    
    if (data === null) {
      const addressData = await clanker.getClankerByAddress(address);
      const page = cursor ? parseInt(cursor) : 1;
      const deployedTokens = await clanker.fetchDeployedByAddress(address, page);
      
      const results = deployedTokens.data.map((token: any) => ({
        contract_address: token.contract_address,
        name: token.name,
        symbol: token.symbol,
        balance: token.balance || '0',
        value_usd: token.value_usd || '0'
      }));
      
      data = { address, results };
      await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 });
    } else if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleClankerSearch(args: any) {
    const { q, limit = '25', cursor } = args;
    
    const cacheKey = `clanker_search:${q}:${limit}:${cursor || ''}`;
    let data = await redis.get(cacheKey);
    
    if (data === null) {
      const page = cursor ? parseInt(cursor) : 1;
      const searchResult = await clanker.searchTokens({ q, page });
      
      const results = searchResult.data.map((token: any) => ({
        id: token.id || '',
        contract_address: token.contract_address,
        name: token.name,
        symbol: token.symbol,
        img_url: token.img_url
      }));
      
      data = { query: q, results };
      await redis.set(cacheKey, JSON.stringify(data), { ex: 600 });
    } else if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleClankerGetTrending(args: any) {
    const { limit = '25', cursor, time_window = '24h' } = args;
    
    const cacheKey = `clanker_trending:${limit}:${time_window}:${cursor || ''}`;
    let data = await redis.get(cacheKey);
    
    if (data === null) {
      data = await clanker.getTrendingTokens();
      await redis.set(cacheKey, JSON.stringify(data), { ex: 1800 });
    } else if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  // Icebreaker handlers
  private async handleIcebreakerGetByEns(args: any) {
    const { name } = args;
    
    const cacheKey = `icebreaker:ens:${name}`;
    let data = await redis.get(cacheKey);
    
    if (data === null) {
      data = await icebreaker.getProfileByENS(name);
      await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 });
    } else if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleIcebreakerGetByEth(args: any) {
    const { address } = args;
    
    const cacheKey = `icebreaker:eth:${address}`;
    let data = await redis.get(cacheKey);
    
    if (data === null) {
      data = await icebreaker.getProfileByWallet(address);
      await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 });
    } else if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleIcebreakerGetByFid(args: any) {
    const { fid } = args;
    
    const cacheKey = `icebreaker:fid:${fid}`;
    let data = await redis.get(cacheKey);
    
    if (data === null) {
      data = await icebreaker.getProfileByFID(fid);
      await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 });
    } else if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleIcebreakerGetByFname(args: any) {
    const { name } = args;
    
    const cacheKey = `icebreaker:fname:${name}`;
    let data = await redis.get(cacheKey);
    
    if (data === null) {
      data = await icebreaker.getProfileByFName(name);
      await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 });
    } else if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleIcebreakerGetCredentials(args: any) {
    const { credentialName, limit = '100', offset = '0' } = args;
    
    const cacheKey = `icebreaker:credentials:${credentialName}:${limit}:${offset}`;
    let data = await redis.get(cacheKey);
    
    if (data === null) {
      data = await icebreaker.getCredentialProfiles(credentialName, limit, offset);
      await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 });
    } else if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleIcebreakerGetBySocial(args: any) {
    const { channelType, username } = args;
    
    const cacheKey = `icebreaker:socials:${channelType}:${username}`;
    let data = await redis.get(cacheKey);
    
    if (data === null) {
      data = await icebreaker.getProfileBySocial(channelType, username);
      await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 });
    } else if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('MCP server running on stdio');
  }

  getServer() {
    return this.server;
  }
}