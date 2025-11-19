## devop_prac_acqusition_app

TypeScript Express starter used for the acquisition API. It ships with Drizzle ORM, Neon, Winston logging, and `tsx`-powered dev workflow.

### Requirements
- Node.js 20+
- npm

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and fill in values:
   ```bash
   cp .env.example .env
   ```
   Required vars: `PORT`, `NODE_ENV`, `LOG_LEVEL`, `DATABASE_URL`.

### Available Scripts
- `npm run dev` – watch mode via `tsx` for local development.
- `npm run build` – compiles TypeScript and rewrites path aliases with `tsc-alias`.
- `npm start` – builds and starts the compiled server.
- `npm run typecheck` – type-check only.
- `npm run db:generate` – generate Drizzle migrations (`drizzle/`).
- `npm run db:migrate:up` / `npm run db:migrate:down` – apply or rollback migrations.
- `npm run db:studio` – open Drizzle Studio UI.

### Logging
Winston is configured in `src/config/logger.ts` and writes to:
- `logs/combined.log`
- `logs/error.log` (only errors)

In non-production environments an additional colorized console transport is enabled. `LOG_LEVEL` controls verbosity.

### Path Aliases
The project uses TS path aliases (e.g. `#configs/logger`). After each build `tsc-alias` rewrites them for the compiled output. When adding new folders, map them in `tsconfig.json`.
