#!/usr/bin/env bun

import { TapMcpServer } from './lib/mcp-server';

async function main() {
  console.log('🔧 Starting Tap MCP Server...');
  const mcpServer = new TapMcpServer();
  await mcpServer.run();
}

main().catch(console.error);