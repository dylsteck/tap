import { chatRoutes } from './routes/chat';
import { farcasterRoutes } from './routes/farcaster'
import { createElysia } from './lib/utils'
import { clankerRoutes } from './routes/clanker';
import { icebreakerRoutes } from './routes/icebreaker';
import { userRoutes } from './routes/user';
import { TapMcpServer } from './lib/mcp-server';

const PORT = 3001;

const app = createElysia()
  .group('/v1', app => app
    .use(chatRoutes)
    .use(clankerRoutes)
    .use(farcasterRoutes)
    .use(icebreakerRoutes)
    .use(userRoutes)
  )

// Add MCP endpoint for testing
app.get('/mcp/status', () => {
  return { status: 'MCP server ready', tools: 'available' };
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
  console.log('🌐 HTTP server only. Set MCP_MODE=true or use --mcp flag to enable MCP server');
}
