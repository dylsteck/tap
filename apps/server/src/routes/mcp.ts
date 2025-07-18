import { createElysia } from '../lib/utils';
import { neynar } from '../services/neynar';
import { warpcast } from '../services/warpcast';
import { clanker } from '../services/clanker';
import { icebreaker } from '../services/icebreaker';
import { redis } from '../lib/redis';

// MCP tool handlers
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
    }
  },
  'farcaster_get_user_casts': {
    handler: handleFarcasterGetUserCasts,
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
    }
  },
  'clanker_search': {
    handler: handleClankerSearch,
    description: 'Search Clanker tokens',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Search query' },
        limit: { type: 'string', description: 'Number of results to return (default: 25)' },
        cursor: { type: 'string', description: 'Pagination cursor' },
      },
      required: ['q'],
    }
  }
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
        inputSchema: TOOLS[name as keyof typeof TOOLS].inputSchema
      })),
      total: Object.keys(TOOLS).length
    };
  })

  // Minimal SSE endpoint - just keep connection alive
  .get('/sse', async ({ set }) => {
    set.headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      start(controller) {
        // Send a simple comment to establish connection
        controller.enqueue(encoder.encode(': MCP server connected\n\n'));

        // Keep connection alive with minimal pings
        const pingInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': ping\n\n'));
          } catch (e) {
            clearInterval(pingInterval);
          }
        }, 30000);

        // Store cleanup function
        (controller as any).cleanup = () => {
          clearInterval(pingInterval);
        };
      },

      cancel() {
        console.log('SSE connection cancelled');
      }
    });

    return new Response(stream, { headers: set.headers });
  })

  // Handle POST requests for MCP protocol
  .post('/sse', async ({ body, set }) => {
    set.headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    try {
      const request = body as any;
      
      if (request.method === 'initialize') {
        return {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'tap-server', version: '1.0.0' }
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
              inputSchema: TOOLS[name as keyof typeof TOOLS].inputSchema
            }))
          }
        };
      }

      if (request.method === 'tools/call') {
        const { name, arguments: args } = request.params;
        
        if (!(name in TOOLS)) {
          return {
            jsonrpc: '2.0',
            id: request.id,
            error: { code: -32601, message: `Tool not found: ${name}` }
          };
        }

        try {
          const tool = TOOLS[name as keyof typeof TOOLS];
          const result = await tool.handler(args);

          return {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
            }
          };
        } catch (error) {
          return {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32603,
              message: `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          };
        }
      }

      return {
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32601, message: `Method not found: ${request.method}` }
      };

    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: (body as any)?.id || null,
        error: { code: -32700, message: 'Parse error' }
      };
    }
  })

  .options('/sse', ({ set }) => {
    set.headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };
    return '';
  });