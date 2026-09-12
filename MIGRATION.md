# Laravel → Hono/TypeScript migration

Working document for the backend migration. Status is current as of the last
commit on `staging`.

**The short version:** phases 0–5 are done and verified. Phase 6 (production
cutover and decommission) has not been started and cannot be done from a
development machine — it needs a production database migration and a hosting
switch. Production is untouched and still runs Laravel on MySQL.

---

## Status

| Phase | Scope | State |
|---|---|---|
| 0 | Foundations | **Partial** — workspace, contracts package, Docker, Render blueprint done. OpenAPI, observability and the SPA split are not. |
| 1 | MySQL → Postgres | **Done, verified** — 38 migrations and 128 tests pass on Postgres. |
| 2 | Hono skeleton + calculators | **Done, verified** — 78/78 differential match against live Laravel. |
| 3 | Auth (Better Auth) | **Done, verified** — Laravel bcrypt passwords still sign in. |
| 4 | Workers, retailers, notifications | **Done, verified** — worker runs from the container, processes both job types. |
| 5 | CRUD, admin and AI surfaces | **Done, verified** — sheets, watch, profile, notifications, devices, dashboard, public endpoints, admin, and the AI agent platform. |
| 6 | Decommission Laravel | **Not started.** |

Section 07 (web app to React) was explicitly deferred — the Vue app stays.

Section 08 items: 422 envelope **done**, money handling **done**, ownership
guard **done** (applies as each controller ports), timezones **done**.

---

## What runs today

```bash
docker compose up -d              # Postgres 17, Valkey 8, Mailpit

cd api && php artisan serve --port=8099   # Laravel, still authoritative
cd server && pnpm dev                     # Hono, port 8787
```

Verification:

```bash
node tools/diff-endpoints.mjs      # 78/78 identical responses, both services live
node tools/diff-sheet-shape.mjs    # record shape matches Laravel, all 26 keys
cd server && pnpm vitest run       # 150
cd packages/contracts && pnpm vitest run   # 101
cd api && php artisan test         # 137
```

The worker:

```bash
cd server && pnpm dev:worker       # registers 3 repeatable jobs, processes both queues
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
server/               Hono API and (eventually) the BullMQ worker
api/                  Laravel, being strangled. Still owns the schema until Phase 6.
web/                  Vue SPA, unchanged
app/                  Expo app, unchanged
tools/                Differential harnesses
```

`api/` and `server/` run against **one database**. Laravel owns the schema:
Drizzle introspects (`pnpm db:pull`) and never writes DDL. Two migration tools
on one schema would be a genuine hazard.

---

## Things worth knowing before continuing

**Production is still MySQL.** `main` auto-deploys to Forge against MySQL. The
Postgres work is local, in tests, and in the Hono service only. Anything touching
raw SQL needs to work on both engines until the production database moves —
`TrackedProduct::scopeNeedsCheck` is the live example and branches on driver.

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

1. **Finish Phase 0.** OpenAPI generation and typed clients — this is the whole
   reason the migration is worth doing, and it is the last piece still missing.
   Then Sentry/PostHog/BetterStack, and split the SPA off Laravel's catch-all.

2. **Phase 6 — production cutover.** See GO-LIVE.pdf for the full runbook. In
   short: stand up Render, migrate the production database MySQL → Postgres,
   cut traffic over, watch it, then delete Laravel and drop
   `personal_access_tokens` and `users.password`.

3. **Still not ported, and deliberately so.** Account deletion requires
   current-password confirmation and token revocation, and Better Auth owns
   credentials now — it needs its own design pass. Phone verification, the
   playground email previews, and the watch-debug endpoints are all
   admin/development tooling with no user-facing path; they can move after
   cutover or be dropped.

4. **Deferred improvements**, each a behaviour change deserving its own commit:
   Bull Board for queue visibility, `expo-server-sdk` in place of the
   hand-rolled push client, React Email for the one remaining template, and the
   Vercel AI SDK for new agents.

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
- No CI job builds the image yet, which is where the three container bugs above
  would have been caught.
- `docker compose` is defined and pulls, but the app processes still run
  natively against a host Postgres/Redis during development.
- Observability is still absent everywhere — four scheduled jobs run unwatched
  and the mobile app has no crash reporting. This was flagged as the highest-value
  standalone item and remains true.
