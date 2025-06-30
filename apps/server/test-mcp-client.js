#!/usr/bin/env node

// Simple MCP client test to verify tools work
const { spawn } = require('child_process');

async function testMCPServer() {
  console.log('🧪 Testing MCP Server Tools...\n');

  // Set environment variables
  const env = {
    ...process.env,
    POSTGRES_URL: "postgresql://localhost:5432/test",
    UPSTASH_REDIS_REST_URL: "http://localhost:6379",
    UPSTASH_REDIS_REST_TOKEN: "test_token",
    NEYNAR_API_KEY: "test_key",
    WARPCAST_API_KEY: "test_key",
    ICEBREAKER_API_KEY: "test_key",
    CLANKER_API_KEY: "test_key",
    AXIOM_TOKEN: "test_token",
    AXIOM_DATASET: "test_dataset",
    OPENAI_API_KEY: "test_key",
    SERVER_BASE_URL: "http://localhost:3001",
    AUTH_SECRET: "test_secret_12345678901234567890123456789012"
  };

  const mcpServer = spawn('bun', ['run', 'src/mcp.ts'], {
    env,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Test list tools request
  const listToolsRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list"
  };

  return new Promise((resolve) => {
    let output = '';
    let errorOutput = '';

    mcpServer.stdout.on('data', (data) => {
      output += data.toString();
      console.log('📥 Server output:', data.toString().trim());
    });

    mcpServer.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.log('📥 Server stderr:', data.toString().trim());
    });

    // Send the list tools request
    setTimeout(() => {
      console.log('📤 Sending list tools request...');
      mcpServer.stdin.write(JSON.stringify(listToolsRequest) + '\n');
    }, 1000);

    // Close after 3 seconds
    setTimeout(() => {
      mcpServer.kill();
      console.log('\n✅ MCP Server test completed');
      console.log('📊 Output length:', output.length);
      console.log('📊 Error length:', errorOutput.length);
      
      if (output.includes('MCP server running')) {
        console.log('✅ Server started successfully');
      }
      
      resolve();
    }, 3000);
  });
}

testMCPServer().catch(console.error);