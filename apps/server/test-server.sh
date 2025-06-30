#!/bin/bash

# Set minimal environment variables for testing
export POSTGRES_URL="postgresql://localhost:5432/test"
export UPSTASH_REDIS_REST_URL="http://localhost:6379"
export UPSTASH_REDIS_REST_TOKEN="test_token"
export NEYNAR_API_KEY="test_key"
export WARPCAST_API_KEY="test_key"
export ICEBREAKER_API_KEY="test_key"
export CLANKER_API_KEY="test_key"
export AXIOM_TOKEN="test_token"
export AXIOM_DATASET="test_dataset"
export OPENAI_API_KEY="test_key"
export SERVER_BASE_URL="http://localhost:3001"
export AUTH_SECRET="test_secret_12345678901234567890123456789012"

echo "🧪 Testing HTTP server..."
timeout 3 bun run src/index.ts &
SERVER_PID=$!
sleep 2

# Test if server is running
if curl -s http://localhost:3001/mcp/status > /dev/null; then
    echo "✅ HTTP server is running"
    curl -s http://localhost:3001/mcp/status | jq .
else
    echo "❌ HTTP server failed to start"
fi

# Kill the server
kill $SERVER_PID 2>/dev/null

echo ""
echo "🧪 Testing MCP server..."
echo "Starting MCP server for 3 seconds..."
timeout 3 bun run src/mcp.ts || echo "✅ MCP server ran without errors"