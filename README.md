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
   Required vars: `PORT`, `NODE_ENV`, `LOG_LEVEL`, `DATABASE_URL`, `JWT_SECRET`.
   Optional overrides: `JWT_EXPIRES_IN`, `JWT_ALGORITHM`, `AUTH_COOKIE_NAME`, `AUTH_COOKIE_MAX_AGE_DAYS`, `COOKIE_DOMAIN`, `BCRYPT_SALT_ROUNDS`, `ARCJET_*`.

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

### JWT Helpers
`src/utils/jwt.ts` wraps `jsonwebtoken` with:
- `signJwt(payload, options?)` – signs payloads with `JWT_SECRET` and defaults from `JWT_EXPIRES_IN`/`JWT_ALGORITHM`.
- `verifyJwt(token, options?)` – verifies tokens, returning `{ valid, expired, payload, error }`.
- `decodeJwt(token)` – decodes tokens without verification for debugging.

The helper throws if `JWT_SECRET` is missing to guard against misconfiguration in production. Configure secrets per environment via `.env`.

### Cookie Helpers
`src/utils/cookie.ts` exposes a `cookie` helper with:
- `cookie.getOptions()` – merges secure defaults (httpOnly, sameSite=strict, secure in prod) with overrides.
- `cookie.set(res, value)` / `cookie.clear(res)` – safely manage the auth cookie defined by `AUTH_COOKIE_NAME`.
- `cookie.get(req)` – reads the cookie value from incoming requests.

Cookie defaults are environment-driven (name, domain, max age) so deployments can tailor them per environment.

### Request Validation
`src/validations/auth.validation.ts` provides Zod schemas for `signup`, `signin`, and `signout`. Use them in middleware to ensure payloads are validated before hitting controllers.

### Auth Services
- `src/services/password.service.ts` hashes and verifies passwords with `bcryptjs`, using `BCRYPT_SALT_ROUNDS` for cost tuning.
- `src/services/user.service.ts` wraps Drizzle queries for the `usersTable` (lookup by email, create user, sanitize user objects) so controllers stay clean.

### Arcjet Protection
- Configuration lives in `src/config/arcjet.ts`. Provide `ARCJET_KEY` (and optional tuning vars) to enable shield, bot detection, and token bucket rate limiting for every request.
- `arcjetSecurityGuard` middleware runs globally from `src/app.ts` to enforce the shield.
- `arcjetSignupGuard` protects the signup/signin routes with Arcjet's `protectSignup` rule (email hygiene + sliding-window rate limiting). Without `ARCJET_KEY`, the guards automatically no-op.
