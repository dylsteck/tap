import { chatRoutes } from './routes/chat';
import { farcasterRoutes } from './routes/farcaster'
import { createElysia } from './lib/utils'
import { clankerRoutes } from './routes/clanker';
import { icebreakerRoutes } from './routes/icebreaker';
import { userRoutes } from './routes/user';
import { TapMcpServer } from './lib/mcp-server';
import { TapMcpSSEServer } from './lib/mcp-sse-server';

const PORT = 3001;

const app = createElysia()
  .group('/v1', app => app
    .use(chatRoutes)
    .use(clankerRoutes)
    .use(farcasterRoutes)
    .use(icebreakerRoutes)
    .use(userRoutes)
  )

// Add MCP status endpoint
app.get('/mcp/status', () => {
  return { status: 'MCP server ready', tools: 'available' };
});

// Add SSE MCP endpoint for hosted access
const sseServer = new TapMcpSSEServer();

app.get('/mcp/sse', async ({ request }) => {
  // Set SSE headers
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  };

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(`data: {"type":"connection","status":"connected"}\n\n`);
      
      // Handle MCP messages here
      // This is a simplified implementation - you'd need to handle the full MCP protocol
      controller.enqueue(`data: {"type":"ready","server":"tap-mcp"}\n\n`);
    }
  });

  return new Response(stream, { headers });
});

// Add MCP tools list endpoint for easy discovery
app.get('/mcp/tools', () => {
  return {
    tools: [
      // Farcaster tools
      'farcaster_get_user',
      'farcaster_get_user_casts', 
      'farcaster_search_casts',
      'farcaster_get_trending',
      'farcaster_get_channels_feed',
      'farcaster_get_cast',
      // Clanker tools
      'clanker_get_by_address',
      'clanker_search',
      'clanker_get_trending',
      // Icebreaker tools
      'icebreaker_get_by_ens',
      'icebreaker_get_by_eth',
      'icebreaker_get_by_fid',
      'icebreaker_get_by_fname',
      'icebreaker_get_credentials',
      'icebreaker_get_by_social'
    ],
    total: 15,
    endpoint: '/mcp/sse'
  };
});

// Start the HTTP server
app.listen(PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

// Initialize MCP server if running in MCP mode
if (process.env.MCP_MODE === 'true' || process.argv.includes('--mcp')) {
  console.log('🔧 Starting MCP server...');
  const mcpServer = new TapMcpServer();
  mcpServer.run().catch(console.error);
} else {
  console.log('🌐 HTTP server with SSE MCP endpoint available at /mcp/sse');
}
