import { createElysia } from '../lib/utils';
import { neynar } from '../services/neynar';
import { warpcast } from '../services/warpcast';
import { clanker } from '../services/clanker';
import { icebreaker } from '../services/icebreaker';
import { redis } from '../lib/redis';

// MCP tool handlers (same logic as the MCP server but for HTTP/SSE)
async function handleFarcasterGetUser(args: any) {
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

  return data;
}

async function handleFarcasterGetUserCasts(args: any) {
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
  
  return data;
}

async function handleClankerSearch(args: any) {
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
  
  return data;
}

// Tool registry
const TOOLS = {
  'farcaster_get_user': {
    handler: handleFarcasterGetUser,
    description: 'Get Farcaster user information by username or FID',
    parameters: {
      type: 'object',
      properties: {
        username: { type: 'string', description: 'Username to lookup' },
        fid: { type: 'string', description: 'FID to lookup' },
      },
      oneOf: [
        { required: ['username'] },
        { required: ['fid'] }
      ]
    }
  },
  'farcaster_get_user_casts': {
    handler: handleFarcasterGetUserCasts,
    description: 'Get casts from a specific Farcaster user',
    parameters: {
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
    }
  },
  'clanker_search': {
    handler: handleClankerSearch,
    description: 'Search Clanker tokens',
    parameters: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Search query' },
        limit: { type: 'string', description: 'Number of results to return (default: 25)' },
        cursor: { type: 'string', description: 'Pagination cursor' },
      },
      required: ['q'],
    }
  }
  // Add more tools as needed
};

export const mcpRoutes = createElysia({ prefix: '/mcp' })
  .get('/status', () => {
    return { 
      status: 'MCP server ready', 
      tools: Object.keys(TOOLS).length,
      transport: 'SSE',
      endpoint: '/mcp/sse'
    };
  })

  .get('/tools', () => {
    return {
      tools: Object.keys(TOOLS).map(name => ({
        name,
        description: TOOLS[name as keyof typeof TOOLS].description,
        parameters: TOOLS[name as keyof typeof TOOLS].parameters
      })),
      total: Object.keys(TOOLS).length
    };
  })

  .get('/sse', async ({ request, set }) => {
    // Set SSE headers
    set.headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        // Send initial handshake
        const initMessage = {
          jsonrpc: '2.0',
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: 'tap-server',
              version: '1.0.0'
            }
          }
        };
        
        controller.enqueue(`data: ${JSON.stringify(initMessage)}\n\n`);

        // Send tools list
        const toolsMessage = {
          jsonrpc: '2.0',
          method: 'tools/list',
          result: {
            tools: Object.keys(TOOLS).map(name => ({
              name,
              description: TOOLS[name as keyof typeof TOOLS].description,
              inputSchema: TOOLS[name as keyof typeof TOOLS].parameters
            }))
          }
        };
        
        controller.enqueue(`data: ${JSON.stringify(toolsMessage)}\n\n`);

        // Keep connection alive
        const keepAlive = setInterval(() => {
          controller.enqueue(`data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`);
        }, 30000);

        // Handle cleanup
        return () => {
          clearInterval(keepAlive);
        };
      }
    });

    return new Response(stream);
  })

  .post('/sse', async ({ body, set }) => {
    try {
      const request = body as any;
      
      if (request.method === 'tools/call') {
        const { name, arguments: args } = request.params;
        
        if (!(name in TOOLS)) {
          return {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32601,
              message: `Tool not found: ${name}`
            }
          };
        }

        const tool = TOOLS[name as keyof typeof TOOLS];
        const result = await tool.handler(args);

        return {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          }
        };
      }

      if (request.method === 'tools/list') {
        return {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            tools: Object.keys(TOOLS).map(name => ({
              name,
              description: TOOLS[name as keyof typeof TOOLS].description,
              inputSchema: TOOLS[name as keyof typeof TOOLS].parameters
            }))
          }
        };
      }

      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32601,
          message: `Method not found: ${request.method}`
        }
      };

    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: (body as any)?.id,
        error: {
          code: -32603,
          message: `Internal error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      };
    }
  });