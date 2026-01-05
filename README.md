<a href="https://tap.computer">
  <h1 align="center">tap</h1>
</a>

<p align="center">
 it just takes one tap
</p>

Tap is an AI assistant built around Farcaster and onchain data to make it easier to find information and take actions. outputs are optimized to show widgets that the user can use to learn more or take an action directly from the chat (eg. RSVP to an event, take an onchain action, send a message etc).

built by [Dylan Steck](https://dylansteck.com)

## Architecture
The core foundation of Tap is built on top of:
- [Next.js](https://nextjs.org)
- [shadcn UI](https://ui.shadcn.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [Postgres](https://www.postgresql.org)
- [Vercel AI SDK](https://sdk.vercel.ai)
- [Anthropic Claude](https://anthropic.com) (via AI SDK)
- [Workflow DevKit](https://workflow.dev)
- [NextAuth](https://next-auth.js.org)

## Tools
Tap leverages LLM tool calling to power the core of its functionality. The following tools are currently supported:
- [Farcaster](https://farcaster.xyz) (using [Neynar APIs](https://neynar.com))
- [ENS Data](https://ensdata.net)
- [Events.xyz](https://events.xyz)
- [Bountycaster](https://bountycaster.com)
- [Icebreaker](https://icebreaker.xyz)
- [Nouns Builder](https://nouns.build)
- [Clanker](https://clanker.world)
- [Zapper](https://zapper.xyz)

For a further understanding of how the assistant tools are defined / to learn how to add your own tool, check out [lib/ai/miniapp-system-prompt.ts](/lib/ai/miniapp-system-prompt.ts) and the API catalog in [lib/apis/catalog.ts](/lib/apis/catalog.ts).

## Contributing

We welcome contributions of all kinds, especially those that introduce new tools/widgets! Here are the main guidelines for contributing:

1. Follow the traditional conventions of the repo (eg: add a new environment variable to `.env.example` if you need to add one, follow the schema for adding other tools, don't add excessive comments, etc)
2. Check out `AGENTS.md` for project conventions and style guidelines.
3. Open a pull request that succinctly describes your changes.
4. If you need help or have questions, feel free to [reach out to me on Farcaster](https://warpcast.com/dylsteck.eth) or tag me in a GitHub discussion.

Thanks for your support in making Tap better!

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Tap.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various AI and authentication provider accounts.

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

Tap should now be running on [localhost:3000](http://localhost:3000/).


---
<p>Originally forked from the <a href="https://github.com/vercel/ai-chatbot">Next.js AI Chatbot Starter Template</a></p>
