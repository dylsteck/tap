# Tap Server

A dual-purpose Elysia server that provides both HTTP API endpoints and MCP (Model Context Protocol) server functionality for Farcaster, Clanker, and Icebreaker services.

## Features

- **HTTP API Server**: RESTful API with OpenAPI/Swagger documentation
- **MCP Server**: Exposes API functions as MCP tools for AI assistants
- **Dual Mode**: Can run both HTTP and MCP servers simultaneously
- **Caching**: Redis-based caching for all endpoints
- **Monitoring**: OpenTelemetry integration with Axiom

## Quick Start

### Prerequisites

- Bun runtime
- PostgreSQL database
- Redis instance
- Required API keys (see Environment Variables)

### Installation

```bash
bun install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
# Database
POSTGRES_URL=postgresql://user:password@localhost:5432/tap

# Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# API Keys
NEYNAR_API_KEY=your_neynar_api_key
WARPCAST_API_KEY=your_warpcast_api_key
ICEBREAKER_API_KEY=your_icebreaker_api_key
CLANKER_API_KEY=your_clanker_api_key
OPENAI_API_KEY=your_openai_api_key

# Monitoring
AXIOM_TOKEN=your_axiom_token
AXIOM_DATASET=your_axiom_dataset

# Server
SERVER_BASE_URL=http://localhost:3001
AUTH_SECRET=your_32_char_secret
```

## Running the Server

### HTTP Server Only (Default)

```bash
bun run start
# or for development
bun run dev
```

The server will start at `http://localhost:3001` with:
- API endpoints at `/v1/*`
- Swagger documentation at `/docs`
- MCP status endpoint at `/mcp/status`

### MCP Server Only

```bash
bun run mcp
# or for development
bun run mcp:dev
```

This starts the MCP server on stdio for use with MCP clients.

### Combined HTTP + MCP Server

```bash
bun run dev:with-mcp
# or
MCP_MODE=true bun run start
# or
bun run start --mcp
```

This runs both the HTTP API server and MCP server simultaneously.

## API Endpoints

### Farcaster Routes (`/v1/farcaster`)
- `GET /user` - Get user by username or FID
- `GET /user/casts` - Get user's casts
- `GET /search` - Search casts
- `GET /feed/trending` - Get trending casts
- `GET /feed/channels` - Get channel feeds
- `GET /cast` - Get specific cast
- `GET /user/by_location` - Get users by location

### Clanker Routes (`/v1/clanker`)
- `GET /address` - Get token info by address
- `GET /search` - Search tokens
- `GET /trending` - Get trending tokens

### Icebreaker Routes (`/v1/icebreaker`)
- `GET /ens` - Get profile by ENS name
- `GET /eth` - Get profile by Ethereum address
- `GET /fid` - Get profile by Farcaster FID
- `GET /fname` - Get profile by Farcaster username
- `GET /credentials` - Get profiles by credential
- `GET /socials/:channelType/:username` - Get profile by social handle

## MCP Tools

The MCP server exposes the following tools (excluding user and chat functions):

### Farcaster Tools
- `farcaster_get_user` - Get user information
- `farcaster_get_user_casts` - Get user's casts
- `farcaster_search_casts` - Search casts
- `farcaster_get_trending` - Get trending casts
- `farcaster_get_channels_feed` - Get channel feeds
- `farcaster_get_cast` - Get specific cast

### Clanker Tools
- `clanker_get_by_address` - Get token by address
- `clanker_search` - Search tokens
- `clanker_get_trending` - Get trending tokens

### Icebreaker Tools
- `icebreaker_get_by_ens` - Get profile by ENS
- `icebreaker_get_by_eth` - Get profile by Ethereum address
- `icebreaker_get_by_fid` - Get profile by FID
- `icebreaker_get_by_fname` - Get profile by username
- `icebreaker_get_credentials` - Get profiles by credential
- `icebreaker_get_by_social` - Get profile by social handle

## Testing

Run the test script to verify both HTTP and MCP functionality:

```bash
./test-server.sh
```

This will:
1. Start the HTTP server and test the `/mcp/status` endpoint
2. Start the MCP server and verify it runs without errors
3. Test the combined mode

## Architecture

- **Elysia**: Fast web framework for TypeScript
- **MCP SDK**: Model Context Protocol implementation
- **Redis**: Caching layer
- **PostgreSQL**: Primary database
- **OpenTelemetry**: Observability and monitoring

## Development

### File Structure

```
src/
├── index.ts          # Main server entry point
├── mcp.ts           # Standalone MCP server
├── lib/
│   ├── utils.ts     # Elysia configuration
│   ├── mcp-server.ts # MCP server implementation
│   └── redis.ts     # Redis configuration
├── routes/          # HTTP route handlers
├── services/        # External API services
└── db/             # Database configuration
```

### Adding New MCP Tools

1. Add the tool definition to `TapMcpServer.setupToolHandlers()`
2. Implement the handler method
3. Test with the MCP client

### Scripts

- `bun run dev` - HTTP server with hot reload
- `bun run mcp:dev` - MCP server with hot reload
- `bun run dev:with-mcp` - Combined mode with hot reload
- `bun run start` - Production HTTP server
- `bun run mcp` - Production MCP server

## License

Private - Tap Protocol