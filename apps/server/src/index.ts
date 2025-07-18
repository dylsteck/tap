import { chatRoutes } from './routes/chat';
import { farcasterRoutes } from './routes/farcaster'
import { createElysia } from './lib/utils'
import { clankerRoutes } from './routes/clanker';
import { icebreakerRoutes } from './routes/icebreaker';
import { userRoutes } from './routes/user';
import { mcpRoutes } from './routes/mcp';
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
  // Add MCP routes (includes /mcp/status, /mcp/tools, /mcp/sse)
  .use(mcpRoutes)

// Start the HTTP server
app.listen(PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
console.log(`🔧 MCP SSE endpoint available at: http://${app.server?.hostname}:${app.server?.port}/mcp/sse`)
console.log(`📋 API documentation: http://${app.server?.hostname}:${app.server?.port}/docs`)

// Always run stdio MCP server in background for local clients
if (process.env.MCP_MODE === 'true' || process.argv.includes('--mcp')) {
  console.log('🔧 Also starting stdio MCP server for local clients...');
  const mcpServer = new TapMcpServer();
  mcpServer.run().catch(console.error);
}
