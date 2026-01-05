# AGENTS.md - Tap Miniapp Builder

## Project Overview

Tap is a chat-first, AI-powered app builder specialized for Farcaster/Base miniapps. Users describe their app idea, AI generates a complete Next.js miniapp optimized for Farcaster/Base, deploys it to a unique subdomain, and allows real-time tweaking via chat or a preview panel.

**Tech Stack:**
- Next.js 16 (App Router)
- Vercel AI SDK v6 with Anthropic Claude
- Workflow DevKit for durable AI pipelines
- Drizzle ORM + Postgres
- Tailwind CSS v4
- wagmi + viem for crypto wallet integration
- Cloudflare Pages for miniapp deployment

## Project Structure

```
tap/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (chat)/            # Chat SDK routes
│   ├── api/               # API routes
│   │   ├── projects/      # Project CRUD + generation
│   │   ├── neynar/        # Farcaster API proxy
│   │   ├── coingecko/     # Price API proxy
│   │   └── zora/          # NFT API proxy
│   ├── create/            # Create new project page
│   ├── profile/           # User profile page
│   └── studio/[id]/       # Project studio (chat + preview)
├── components/            # React components
│   ├── ui/               # Shadcn/Radix primitives
│   ├── ai-elements/      # AI chat components
│   └── *.tsx             # Feature components
├── lib/                   # Utilities and services
│   ├── ai/               # AI prompts and models
│   ├── apis/             # API catalog
│   ├── db/               # Database schema and queries
│   ├── services/         # External service integrations
│   ├── wallet/           # Wallet configuration
│   └── workflows/        # Workflow DevKit definitions
└── hooks/                # Custom React hooks
```

## Code Style & Conventions

### TypeScript
- Use strict TypeScript with explicit types
- Prefer interfaces over types for object shapes
- Use `type` for unions and utility types
- Avoid `any` - use `unknown` with type guards

### React Components
- Use function components with arrow syntax in `'use client'` files
- Use `export default function` for page components
- Props interfaces named `{ComponentName}Props`
- Colocate component-specific types

```tsx
'use client'

interface ProjectCardProps {
  project: Project
  onDelete?: (id: string) => void
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  // ...
}
```

### File Naming
- Components: `PascalCase.tsx` (e.g., `ProjectCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `miniapp-system-prompt.ts`)
- API routes: `route.ts` in appropriate folder structure

### Imports
- Use `@/` path alias for imports
- Group imports: React → Next.js → External → Internal → Types

```tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { anthropic } from '@ai-sdk/anthropic'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/db/schema'
```

## Database Patterns

### Schema Location
All schema definitions in `lib/db/schema.ts` using Drizzle ORM.

### Query Functions
All database queries in `lib/db/queries.ts`:
- Prefix CRUD operations: `create*`, `get*`, `update*`, `delete*`
- Always use try/catch with `ChatSDKError`
- Return single items or null, arrays for lists

```ts
export async function getProjectById({ id }: { id: string }) {
  try {
    const [project] = await db
      .select()
      .from(project)
      .where(eq(project.id, id));
    return project || null;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to get project");
  }
}
```

### Migrations
- Run `pnpm db:generate` after schema changes
- Migration files in `lib/db/migrations/`
- Apply with `pnpm db:migrate`

## API Route Patterns

### Authentication
All protected routes check session:

```ts
import { auth } from '@/app/(auth)/auth'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ...
}
```

### Error Handling
Return consistent error responses:

```ts
return NextResponse.json({ error: 'Descriptive message' }, { status: 4XX })
```

### Dynamic Route Params
In Next.js 16, params are a Promise:

```ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // ...
}
```

## AI Integration

### Provider
Using Anthropic Claude via AI SDK:

```ts
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

const result = await generateText({
  model: anthropic('claude-sonnet-4-20250514'),
  system: MINIAPP_SYSTEM_PROMPT,
  prompt: userMessage,
  maxOutputTokens: 4000,
})
```

### System Prompts
- Located in `lib/ai/miniapp-system-prompt.ts`
- Include mobile-first design requirements
- Include API integration patterns
- Include code templates for common use cases

## UI Design Principles

### Mobile-First
- Max width: 430px for main content
- Touch targets: minimum 44px
- Safe area padding: `pb-safe` for home indicator

### Dark Theme
Primary colors:
- Background: `#000` (black), `#0A0A0A`, `#18181b` (zinc-900)
- Text: white, zinc-400, zinc-500, zinc-600
- Borders: zinc-800, zinc-700
- Accents: Use solid colors, avoid gradients

### Design Aesthetic
**Keep it minimal and refined:**
- NO gradients (especially purple/violet gradients)
- Use solid backgrounds with subtle borders
- White on black for primary CTAs
- Zinc-800/900 backgrounds for cards and containers
- Clean, precise spacing
- Subtle transitions, no flashy animations

### Component Patterns
```tsx
// Use cn() for conditional classes
<button className={cn(
  "px-4 py-2 rounded-xl font-medium transition-all",
  isActive ? "bg-white text-black" : "bg-zinc-800 text-white"
)}>

// Card pattern - solid background, subtle border
<div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">

// Icon containers - simple, no gradients
<div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center">
```

## Workflow DevKit

### Definition
Use `"use workflow"` and `"use step"` directives:

```ts
"use workflow";

export async function generateMiniappWorkflow({ projectId, prompt }) {
  "use step";
  
  const code = await generateCodeWithAI(prompt);
  return { projectId, code };
}
```

### Steps
Each step should be idempotent and can be retried:

```ts
async function generateCodeWithAI(prompt: string) {
  "use step";
  
  const result = await generateText({...});
  return extractCode(result.text);
}
```

## Environment Variables

Required:
- `DATABASE_URL` - Postgres connection string
- `NEXTAUTH_SECRET` - Auth secret
- `ANTHROPIC_API_KEY` - Claude API key

Optional:
- `NEYNAR_API_KEY` - Farcaster API
- `COINGECKO_API_KEY` - Price data
- `CLOUDFLARE_API_TOKEN` - Deployment
- `CLOUDFLARE_ACCOUNT_ID` - Deployment

## Testing

### E2E Tests
Located in `tests/e2e/` using Playwright:

```bash
pnpm test
```

### Test Files
- `tests/e2e/auth.test.ts` - Authentication flow tests
- `tests/e2e/feed.test.ts` - Home page and navigation tests
- `tests/e2e/projects.test.ts` - Project CRUD and API tests
- `tests/e2e/studio.test.ts` - Studio page tests
- `tests/e2e/api-integrations.test.ts` - API proxy endpoint tests

### When to Update Tests
**Always update tests when:**
- Adding new pages or routes
- Modifying API endpoints
- Changing authentication flows
- Updating UI components that have test coverage
- Adding new features

### Test Helpers
Use helpers from `tests/helpers.ts`:
```ts
import { generateRandomTestUser, mockAuthenticatedSession } from '../helpers'
```

### Mocking in Tests
```ts
// Mock authenticated session
await page.route("**/api/auth/session", async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ user: { id: "test-id", email: "test@example.com" } }),
  });
});

// Mock API responses
await page.route("**/api/projects", async (route) => {
  await route.fulfill({ status: 200, body: JSON.stringify({ projects: [] }) });
});
```

### Local Development
```bash
pnpm dev          # Start dev server
pnpm db:studio    # Drizzle Studio UI
pnpm lint         # Run linter
pnpm format       # Auto-fix formatting
```

## Common Tasks

### Adding a New API Integration

1. Add to `lib/apis/catalog.ts`:
```ts
newapi: {
  id: 'newapi',
  name: 'New API',
  emoji: '🆕',
  description: 'What it does',
  category: 'data',
  docsUrl: 'https://...',
  envVars: ['NEWAPI_KEY'],
  codeExamples: [...]
}
```

2. Create proxy route in `app/api/newapi/route.ts`

### Adding a New Miniapp Template

1. Add to `lib/ai/miniapp-system-prompt.ts` in `MINIAPP_TEMPLATES`:
```ts
'template-name': {
  name: 'Template Name',
  description: 'What it creates',
  code: `'use client'\n\nexport default function TemplateApp() {...}`
}
```

### Creating a New Feature Page

1. Create folder: `app/feature-name/page.tsx`
2. Include `BottomNav` component for navigation
3. Add route to bottom nav if needed
4. Use mobile-first, dark theme styling

## Deployment

### Vercel (Main App)
- Push to main branch triggers deploy
- Environment variables in Vercel dashboard

### Cloudflare Pages (Miniapps)
- Deployed via API in `lib/services/cloudflare.ts`
- Each miniapp gets `{subdomain}.tap.computer` URL

## Key Files Reference

| File | Purpose |
|------|---------|
| `lib/db/schema.ts` | Database schema definitions |
| `lib/db/queries.ts` | Database query functions |
| `lib/ai/miniapp-system-prompt.ts` | AI prompts and templates |
| `lib/apis/catalog.ts` | API integration catalog |
| `lib/services/cloudflare.ts` | Deployment service |
| `lib/wallet/config.ts` | wagmi/viem setup |
| `components/bottom-nav.tsx` | Main navigation |
| `components/preview-frame.tsx` | Miniapp preview |
| `app/api/projects/[id]/generate/route.ts` | AI code generation |

