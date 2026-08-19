# Deployment

Production runs at **https://thefrugalist.io** behind Cloudflare. Laravel serves both
the API and the built Vue SPA from a single origin, and deploys are triggered from the
hosting panel (Forge/Ploi-style) rather than from CI.

## Topology

The web app is not deployed separately. `web/` builds into `api/public/web/`, and
Laravel serves it:

- `routes/web.php` has a catch-all that returns `public/web/index.html` for any
  non-`api`/`sanctum`/`web` path.
- `web/vite.config.ts` sets `build.outDir` to `../api/public/web` and uses base `/web/`
  in production.

**`api/public/web` is listed in `api/.gitignore`.** The built SPA is therefore never
committed, so a deploy that only runs `git pull` will leave the frontend stale — the
web build has to run on the server as part of every deploy.

## Requirements

| | Version | Note |
|---|---|---|
| PHP | **8.3+** | Laravel 13 requires `^8.3`. Verify the panel's PHP version before the next deploy — this changed from 8.2. |
| Node | 22 | |
| pnpm | 10 | Both `web/` and `app/` use pnpm lockfiles. |
| MySQL | | |
| Redis | | `QUEUE_CONNECTION=redis`, plus Horizon. |

## Deploy script

```bash
cd /path/to/the-frugalist

git pull origin main

# API
cd api
composer install --no-dev --optimize-autoloader --no-interaction
php artisan migrate --force

# Web SPA -> api/public/web (gitignored, so it must be rebuilt here)
cd ../web
pnpm install --frozen-lockfile
pnpm run build

# Cache last, after the build has landed
cd ../api
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan horizon:terminate   # supervisor restarts it with the new code
```

`php artisan config:cache` must run *after* `.env` is final; a cached config ignores
later `.env` edits until it is rebuilt.

## Environment

`api/.env` is not in the repo. `api/.env.example` lists every key. The ones that must
be set for a working deploy:

- `APP_KEY` (generate once with `php artisan key:generate`), `APP_ENV=production`,
  `APP_DEBUG=false`, `APP_URL=https://thefrugalist.io`
- `DB_*`
- `REDIS_*`, `QUEUE_CONNECTION=redis`, `CACHE_STORE`
- `MAIL_MAILER=resend` and `RESEND_KEY` — required for email verification and price
  alerts. Not covered by tests, which run with `MAIL_MAILER=array`.
- `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM` for phone verification
- `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN`

The mobile app reads `API_URL` from `app/.env.production` (`https://thefrugalist.io/api`),
which *is* committed.

## Background work

`routes/console.php` schedules the whole price-tracking feature:

| Command | Cadence |
|---|---|
| `prices:check` | hourly |
| `prices:check --limit=100` | twice daily (09:00, 21:00) |
| `notifications:send-price-alerts` | every 15 minutes |
| `horizon:snapshot` | every 5 minutes |

Both the scheduler and a queue worker must be running, or price tracking silently does
nothing — no errors, just no price updates and no alerts:

```bash
php artisan horizon        # under supervisor, restarted by horizon:terminate on deploy
```

plus a system cron entry:

```
* * * * * cd /path/to/the-frugalist/api && php artisan schedule:run >> /dev/null 2>&1
```

Worth confirming both are actually running on the box before demoing price tracking.

## Mobile

Mobile does not deploy with the server. Builds go through EAS:

```bash
cd app
pnpm build:production:ios
pnpm build:production:android
```

`app/eas.json` currently submits under the Apple account `jason@tensifi.com`
(team `44BTVU6QAF`) — see issue #6 about moving this to the JayTech account.

## Known gaps

- **No staging environment.** `app/.env.staging` points at
  `https://staging.thefrugalist.io`, which does not resolve. Either stand that host up
  or stop shipping a staging app profile that cannot reach an API.
- **Deploys are not automated.** CI (`.github/workflows/ci.yml`) verifies branches but
  does not deploy; the panel still has to be triggered.
- **Production reference data is empty.** `/api/retailers` and `/api/announcements`
  both return empty, so the price-tracking features look dead on a fresh look.
  `database/seeders/RetailerSeeder.php` exists — run it before demoing:

  ```bash
  php artisan db:seed --class=RetailerSeeder --force
  ```
