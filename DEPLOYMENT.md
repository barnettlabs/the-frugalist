# Deployment

The stack is a Hono/Node API, a BullMQ worker, Postgres, Redis and a static Vue
site. Everything is declared in `render.yaml`, so deploys come from a Render
Blueprint rather than a shell script.

For the first-time cutover — provisioning, the database migration, routing and
rollback — see the go-live runbook. This file covers steady-state deploys.

## Topology

| Component | Runs as | Command |
|---|---|---|
| API | Render Web Service (Docker) | `node server/dist/server.js` |
| Worker | Render Background Worker (same image) | `node server/dist/worker.js` |
| Postgres | Render Postgres 17 | — |
| Redis | Render Key Value | — |
| Web | Render Static Site | built from `web/dist` |

**One image, two services.** The API and worker ship the same build and differ
only in start command, which is why the worker costs no extra build time or
registry space.

## Requirements

| | Version | Note |
|---|---|---|
| Node | **24** in the container | Development runs on 22; the Dockerfile pins the deploy target. |
| pnpm | 10 | Workspace root holds the lockfile. |
| Postgres | **17** | Must be **UTC**. Every stored timestamp is UTC and comparisons assume it. |
| Redis | Valkey 8 or Redis 7 | **`maxmemory-policy` must be `noeviction`** — see below. |

## Deploys

Push to the branch Render tracks. The Blueprint handles the rest:

1. Build the image (`Dockerfile`).
2. Run the pre-deploy command — `node server/dist/scripts/migrate.js` — which
   applies any pending Drizzle migration. It runs once per deploy rather than
   per instance, so instances cannot race. A failure here fails the deploy,
   which is deliberate: a service running against a half-migrated schema is far
   harder to diagnose.
3. Health-check `/up` and cut over with zero downtime.

Both processes handle `SIGTERM`: the API drains in-flight requests, the worker
finishes its current job rather than being killed mid-run, and both flush
telemetry before exiting.

## Two settings that will bite

**Redis must be `noeviction`.** BullMQ cannot behave correctly if Redis evicts
keys — it loses jobs silently rather than erroring. The worker asserts this at
boot and refuses to start otherwise, which is the intended behaviour: a queue
that looks healthy while dropping work is worse than one that will not launch.
Render's free Key Value tier is also non-persistent, so it cannot back a queue.

**Postgres PITR depth comes from the workspace plan, not the database tier.** A
Hobby workspace gives a 3-day recovery window on any instance size; 7 days needs
a Pro workspace. Upgrading the database will not change it.

## Schema changes

Drizzle owns the schema.

```bash
# 1. change the database (migration, or by hand in development)
# 2. regenerate the typed schema
cd server && pnpm db:pull

# 3. produce a migration
pnpm db:generate --name=what_changed

# 4. review the SQL in server/drizzle/ before committing
```

`src/db/schema.ts` is generated — do not hand-edit it. `tools/normalize-schema.mjs`
corrects three drizzle-kit generation bugs on every pull; the reasons are
documented in that file, and one of them produced SQL Postgres rejected outright.

## Environment

`server/.env.example` lists every key. The ones a deploy will not work without:

- `DATABASE_URL`, `REDIS_URL` — wired from the linked Render services
- `SESSION_SECRET` — 32+ chars; **rotating it invalidates every session**
- `APP_URL` — used to build verification and password-reset links
- `CORS_ORIGINS` — comma-separated
- `MAIL_TRANSPORT=resend` and `RESEND_KEY` — **`MAIL_TRANSPORT` defaults to
  `log`**, so email silently goes nowhere until it is set. That default is
  deliberately fail-safe, but it does have to be set in production.
- `SENTRY_DSN` — the API logs a warning at boot in production if it is missing
- `HEARTBEAT_PRICE_CHECK_URL`, `HEARTBEAT_SEND_ALERTS_URL` — cron monitors

**Do not set `RUN_WORKER_IN_PROCESS` in production.** It exists so one local
`pnpm dev` can run both roles; on Render it would make the API and the worker
both process jobs, double-running the price check and sending users duplicate
alerts.

## Scheduled work

There is no cron service. The worker registers three BullMQ repeatable jobs on
boot — hourly and twice-daily price checks, and alert notifications every 15
minutes — so cadence, retries, overlap prevention and observability all live in
one system. Registration is idempotent, so restarts do not stack duplicates.

Overlap prevention is a Redis lock, not worker concurrency: concurrency only
serialises within one process, and a rolling deploy briefly runs two. Without
the lock, two price checks would send duplicate alerts for one price drop.

## Monitoring

- `/up` — liveness. Deliberately does **not** touch the database: a health check
  that fails on a slow query turns a database blip into a restart loop.
- `/health` — readiness, including the database. Point uptime checks here.
- Cron heartbeats — the most valuable monitor, because a silently dead scheduler
  produces no errors and no traffic. Alerts simply stop arriving otherwise.
