# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup
npm run setup          # Install deps, generate Prisma client, run migrations

# Development
npm run dev            # Start dev server with Turbopack

# Build & test
npm run build
npm run lint
npm test               # Run all Vitest tests

# Database
npm run db:reset       # Reset SQLite database
npx prisma generate    # Regenerate Prisma client after schema changes
npx prisma migrate dev # Run new migration
```

To run a single test file: `npx vitest run src/lib/transform/__tests__/jsx-transformer.test.ts`

## Environment

Optional: create a `.env` file with `ANTHROPIC_API_KEY=sk-...`. Without it, the app falls back to a mock provider that returns static code.

## Architecture

**UIGen** is a Next.js 15 App Router app where users describe React components in a chat interface and Claude generates them with live preview.

### Data flow

1. User sends a message → `POST /api/chat` (streaming)
2. The API route uses Vercel AI SDK with Claude Haiku 4.5 (`src/lib/provider.ts`)
3. Claude responds with tool calls (`str_replace`, `file_manager`) to write files into a virtual file system
4. The virtual file system (`src/lib/file-system.ts`) is held in `FileSystemContext` — it is purely in-memory (no disk writes) and serializable to JSON
5. After generation completes, the API route saves chat messages + serialized file system to the SQLite database via Prisma
6. The preview frame (`src/components/preview/`) uses Babel Standalone to compile JSX in the browser and render the component live

### Key subsystems

- **Virtual file system** (`src/lib/file-system.ts`): In-memory tree of files/dirs. AI tools write here; the preview compiles from here.
- **AI tools** (`src/lib/tools/`): `str_replace` for editing file content, `file_manager` for create/delete operations.
- **Provider** (`src/lib/provider.ts`): Wraps `@ai-sdk/anthropic`. Returns mock responses when `ANTHROPIC_API_KEY` is absent.
- **Auth** (`src/lib/auth.ts`): JWT-based, stored in cookies. `jose` for signing, `bcrypt` for passwords. Anonymous users get a session but projects aren't persisted.
- **State management**: Two React contexts — `FileSystemContext` and `ChatContext` — hold all UI state. Server actions (`src/actions/`) handle DB reads/writes.
- **JSX transform** (`src/lib/transform/jsx-transformer.ts`): Transforms generated code before rendering in the preview iframe.

### Database

SQLite via Prisma. Schema has two models: `User` and `Project`. Projects store `messages` (JSON chat history) and `data` (serialized virtual file system). Prisma client is generated into `src/generated/prisma/`.

### Path alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).
