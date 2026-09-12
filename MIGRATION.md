# Laravel → Hono/TypeScript migration

Working document for the backend migration. Status is current as of the last
commit on `staging`.

**The short version:** the migration is code-complete. Laravel and MySQL are
gone from the repository, Drizzle owns the schema, and observability and a
container CI build are in place. What remains is deployment — provisioning
Render, migrating whatever production data you want to keep, and routing — which
needs your credentials and is covered by the go-live runbook.

**Production is currently down** until the new stack is deployed. That was a
deliberate, accepted trade: the Forge deploy served the deleted Laravel app.

---

## Status

| Phase | Scope | State |
|---|---|---|
| 0 | Foundations | **Done** — workspace, contracts package, Docker, Render blueprint, observability, container CI, SPA split. OpenAPI is the one outstanding item. |
| 1 | MySQL → Postgres | **Done, verified** — 38 migrations and 128 tests pass on Postgres. |
| 2 | Hono skeleton + calculators | **Done, verified** — 78/78 differential match against live Laravel. |
| 3 | Auth (Better Auth) | **Done, verified** — Laravel bcrypt passwords still sign in. |
| 4 | Workers, retailers, notifications | **Done, verified** — worker runs from the container, processes both job types. |
| 5 | CRUD, admin and AI surfaces | **Done, verified** — sheets, watch, profile, notifications, devices, dashboard, public endpoints, admin, and the AI agent platform. |
| 6 | Decommission Laravel | **Done in the repo** — Laravel deleted, schema owned by Drizzle. Deployment is yours to run. |

Section 07 (web app to React) was explicitly deferred — the Vue app stays.

Section 08 items: 422 envelope **done**, money handling **done**, ownership
guard **done** (applies as each controller ports), timezones **done**.

---

## What runs today

```bash
docker compose up -d               # Postgres 17, Valkey 8, Mailpit
cd server && pnpm db:migrate       # build the schema
cd server && pnpm dev              # API on :8787
cd server && pnpm dev:worker       # worker + the repeatable schedule
cd web && pnpm dev                 # SPA
```

Verification:

```bash
cd server && pnpm vitest run               # 177
cd packages/contracts && pnpm vitest run   # 101, incl. the frozen parity suite
cd web && pnpm run check-all               # 36
node tools/diff-sheet-shape.mjs            # record shape, all 26 keys
docker build -t frugalist-server .         # the check CI runs
```

The container builds and serves:

```bash
docker build -t frugalist-server .
docker run --rm -p 8788:8787 -e DATABASE_URL=... -e REDIS_URL=... \
  -e SESSION_SECRET=... frugalist-server
```

---

## Layout

```
packages/contracts/   Zod schemas, calculators, money, datetime — shared with both clients
server/               Hono API and the BullMQ worker
web/                  Vue SPA, unchanged
app/                  Expo app, unchanged
tools/                Differential harnesses
```

**Drizzle owns the schema.** Migrations live in `server/drizzle/`, with
`0000_baseline.sql` being the full 23-table schema as it stood when Laravel was
removed — generated from the live database, so it reproduces exactly what 40
Laravel migrations produced. `src/db/schema.ts` is generated: change the
database, then `pnpm db:pull`.

---

## Things worth knowing before continuing

**`main` still points at the deleted Laravel app.** Do not merge `staging` into
`main` expecting a working deploy — the Forge hook has to be removed and Render
stood up first. See the go-live runbook.

**Three drizzle-kit generation bugs are corrected on every `db:pull`** by
`server/tools/normalize-schema.mjs`, and the reasons are documented there. One
of them — wrong operator classes on composite indexes — produced a baseline
migration Postgres rejected outright, so the normalizer is not optional.

**The response contract is snake_case.** Laravel serialised Eloquent models with
column names, and both clients type against that (`web/src/types/models.ts`).
Drizzle returns camelCase. Every record response goes through `serializeRow`.
This was found by differential testing after the endpoint tests missed it — they
had been written to match the implementation rather than the contract.

**The 422 envelope is a hard contract.** 1,765 LOC across both clients read
`error.response.data.errors` as a field → `string[]` map. Laravel's top-level
`message` is the first error plus a count of the rest, not a fixed sentence, and
`:attribute` renders `sales_tax_percent` as "sales tax percent". Reproduced in
`packages/contracts/src/errors.ts` and `server/src/http/rules.ts`.

**Ownership is one operation, not two.** Laravel's route model binding resolved
the record and the controller checked the owner separately. `findOwned()` does
both together so it cannot be half-performed. Every id-addressed route uses it.

**Native clients send no Origin.** Better Auth rejects untrusted origins, and a
React Native fetch sends none — mobile sign-in fails with
`MISSING_OR_NULL_ORIGIN` while the web app works fine. The Expo plugin and the
app's scheme (`thefrugalist://`) are configured. Note Hono's in-process
`app.request()` bypasses that middleware, so origin rejection can only be
verified over real HTTP.

**Build the container in CI.** Three failures were invisible under `tsx` and
`vitest`, which transpile on the fly: the pnpm workspace symlink layout must be
preserved rather than flattened, drizzle-kit emits extensionless ESM imports that
plain Node rejects, and `@frugalist/contracts` needs a real build because its
exports pointed at `.ts` source.

---

## Next steps, in order

1. **Deploy.** Provision Render from `render.yaml`, set the environment group,
   and route `thefrugalist.io/api/*` at the API service. The runbook covers
   tiers, every environment variable, and rollback.

2. **OpenAPI generation and typed clients.** The last outstanding item from
   Phase 0, and the whole reason the migration was worth doing — 1,765 LOC of
   hand-written client types are still hand-maintained. `@hono/zod-openapi` is
   already a dependency.

3. **Retire the auth compatibility layer.** `server/src/routes/auth-compat.ts`
   translates the Sanctum-shaped endpoints onto Better Auth so the shipped
   mobile build keeps working. Delete it once both clients call `/api/auth/*`
   and the old builds have aged out — not before.

4. **Not ported, deliberately.** Phone verification, the playground email
   previews and the watch-debug endpoints are admin/development tooling with no
   user-facing path. Port them if you want them; nothing depends on them.

5. **Deferred improvements**, each a behaviour change deserving its own commit:
   Bull Board for queue visibility, `expo-server-sdk` in place of the
   hand-rolled push client, React Email for the one remaining template, the
   Vercel AI SDK for new agents, and converting the legacy `double precision`
   money columns to `numeric`.

---

## Latent defects found while porting

All three are **preserved bug-for-bug** in the TypeScript port. Each one changes
what users receive, so fixing it is a behaviour change that belongs in its own
commit with the consequences thought through — not buried inside a migration.

**Home Depot prices have always been 0.00.** `HomeDepotService::parseProductData`
sets a `price` key, but `standardizeProductData` only reads `retail_price` and
`current_price`. The price is parsed correctly and then dropped. Fixing it is a
one-line change — and it would immediately start firing price-drop alerts for
every Home Depot product that has looked free since the feature shipped, so the
alert consequences need thinking about first.

**The price-drop email's "View Product" button has never rendered.** The Blade
template guards on `$product->retailer_url`, and there is no such column on
`tracked_products`; Eloquent returns null for a missing attribute rather than
erroring. The URL *is* available in `product_metadata`, which the retailer
clients populate. `priceDropEmail` accepts an `availableRetailerUrl` parameter
that is deliberately unused, so turning it on is a one-line change in one place.

**SMS has never run.** The branch in `CheckProductPrices` was commented out
"waiting for Twilio approval". It is left out of the port entirely rather than
ported-and-disabled, so the code does not imply a working path. The Twilio
client is still needed for phone verification, which does work.

## Known gaps

- The Docker image is 675MB, larger than it should be. The prod-deps stage
  copies more of the pnpm store than it needs.
- **The clients still call the compatibility auth endpoints.** They work, but
  both apps should move to `/api/auth/*` so the shim can go.
- **The mobile app has no crash reporting yet.** Sentry is wired server-side;
  the Expo client needs `@sentry/react-native` added separately, and that is
  where RN source maps and native symbolication pay for themselves.
- The calculator parity reference is frozen. Still a valid regression suite, but
  a new case cannot take a Laravel-derived expectation — see the note in
  `parity.test.ts`.
