# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

pnpm workspace monorepo:

- **`server/`** — Hono API and BullMQ worker (TypeScript, Node 24)
- **`packages/contracts/`** — Zod schemas, calculators, money and datetime helpers, shared with both clients
- **`web/`** — Vue 3 SPA (standalone static site)
- **`app/`** — React Native / Expo mobile app
- **`tools/`** — contract-verification scripts
- **`shared/`** — brand assets

The backend was migrated from Laravel/PHP + MySQL to Hono/TypeScript + Postgres.
`MIGRATION.md` records what changed and why; several decisions in the code only
make sense with that history, and the comments say so where it matters.

## Development Commands

### Running everything

```bash
pnpm dev                      # containers, contracts build, migrations, all 3 processes
pnpm dev --no-web             # API and worker only
```

`scripts/dev.sh` is the whole local stack in one command. The three processes
are the last step; the two before them are the ones that cost time when skipped
- contracts has to be *built* because its exports resolve through `dist/`, and
the database has to be *migrated* because a fresh container starts empty. Ctrl-C
stops everything.

To run the pieces separately, see the sections below.

### Local dependencies

```bash
docker compose up -d          # Postgres 17, Valkey 8, Mailpit (UI on :58025)
```

These publish on non-default ports (Postgres `55432`, Valkey `56379`) so they
cannot collide with a host install. `server/.env.example` points at them
deliberately: a host Postgres 14 answering on 5432 will run the app and the
suite quite happily, and you will not find out you were testing against the
wrong engine version until production.

### Server — run from `server/`

```bash
pnpm dev                      # API on :8787, watch mode
pnpm dev:worker               # BullMQ worker + the repeatable schedule
pnpm test                     # Vitest (needs Postgres + Redis)
pnpm db:migrate:test          # apply migrations to the test database
pnpm type-check
pnpm db:migrate               # apply Drizzle migrations
pnpm db:seed                  # reference data (retailers, schedules, AI agents)
pnpm db:pull                   # regenerate schema.ts from the database
pnpm db:generate              # create a migration from schema changes
pnpm check-all                # type-check + tests
```

### Contracts — run from `packages/contracts/`

```bash
pnpm build                    # required: the package exports compiled output
pnpm test                     # includes the frozen calculator parity suite
```

### Web — run from `web/`

```bash
pnpm dev
pnpm build                    # client + SSR prerender + sitemap -> dist/
pnpm check-all                # lint, type-check, format, tests
```

### Mobile — run from `app/`

```bash
pnpm start
pnpm ios | pnpm android
pnpm check-all                # lint, type-check, translations, tests
```

## Architecture

### Server (`server/`)

**Stack**: Node 24, Hono, Drizzle (postgres.js), Zod, Better Auth, BullMQ on
Valkey, pino, Sentry, PostHog.

```
src/
  config/         Zod-validated env, parsed once at boot
  db/             Drizzle client, generated schema, money + serialisation helpers
  http/           app wiring, error handler, auth middleware, ownership guard,
                  Laravel-compatible validation rules, paginator
  routes/         one module per resource
  services/       retailers, notifications, AI pipeline
  jobs/           BullMQ queues, the repeatable schedule, job handlers
  observability/  Sentry, PostHog, cron heartbeats
  scripts/        migrator
```

### Conventions that are load-bearing

These are not style preferences — breaking any of them breaks a client or hides
a bug. Each is explained at the relevant source file.

- **Responses are snake_case.** Drizzle properties are camelCase; both clients
  type against snake_case. Every record response goes through `serializeRow`.
- **Errors use the 422 envelope** in `packages/contracts/src/errors.ts`:
  `{ message, errors: { field: [msg] } }`. The top-level `message` is the first
  error plus a count of the rest.
- **Ownership is one operation.** Anything addressed by id resolves through
  `findOwned()`, which does the lookup and the ownership check together so it
  cannot be half-performed.
- **Ownership never comes from the request body.** It comes from the session.
- **Money**: `numeric` columns arrive from Postgres as strings — read them
  through `readMoney`. Some legacy columns are `double precision`; see
  `db/money.ts`.
- **Time is UTC** in the database and in comparisons. Convert only for display.
- **`db/schema.ts` is generated.** Do not hand-edit it; change the database with
  a migration and run `pnpm db:pull`. `tools/normalize-schema.mjs` fixes three
  drizzle-kit generation bugs on every pull and the reasons are documented there.

### Seeding

`pnpm db:seed` inserts the rows the app needs to function but that migrations do
not create: the Best Buy retailer, the three global price-check schedules, and
the AI provider, agents and routes. Without them those features do not fail
loudly - they resolve nothing and quietly do nothing.

Every insert is keyed on a natural key and skipped when present, so it is safe
to re-run and safe in production. It deliberately never *updates*: `is_active`,
`enabled` and API keys are operator-owned, and a seed that reset them on each
deploy would be a trap.

The first user is created by the same script, and only when asked:

```bash
SEED_EMAIL=you@example.com SEED_PASSWORD='...' SEED_ADMIN=true pnpm db:seed
```

It goes through Better Auth's sign-up rather than inserting rows, because a
user is a profile *and* a credential account, and the hash has to match what
sign-in verifies with. An existing user is never modified - the password is not
reset - though `SEED_ADMIN=true` will promote one.

### Database

Postgres 17. Drizzle owns the schema: migrations live in `server/drizzle/`, with
`0000_baseline.sql` being the full schema as it stood when Laravel was removed.

## Code Conventions

### Server
- `type` over `interface`; avoid enums (use `as const`)
- Named exports; absolute-ish relative imports with explicit `.js` extensions
  (required by ESM at runtime)
- Comment the *why*, especially where behaviour looks odd — most of it is
  preserved on purpose

### Web (`web/`)
- Vue component order: script, template, styles
- Absolute imports (`@/...`)
- Custom Tailwind with CSS variables; Rubik font family

### Mobile (`app/`)
- `pnpm` only; install packages with `npx expo install <package>`
- kebab-case filenames; named exports; absolute imports (`@/...`)
- Functional components; files under 80 lines
- Tests: `component-name.test.tsx`, for utilities and complex components

## Git Workflow

Always work on a branch — never commit directly to `main`.

| Type | When | Pattern |
|------|------|---------|
| `feature/` | New functionality | `feature/short-description` |
| `fix/` | Bug fix | `fix/short-description` |
| `hotfix/` | Urgent production fix | `hotfix/short-description` |
| `chore/` | Deps, config, cleanup | `chore/short-description` |
| `refactor/` | Restructure, no behaviour change | `refactor/short-description` |

`staging` is the integration branch; `main` holds released code only.

## Git Commits

Conventional commits: `fix:`, `feat:`, `perf:`, `docs:`, `style:`, `refactor:`,
`test:`, `chore:`. Lowercase subject, max 100 characters.
