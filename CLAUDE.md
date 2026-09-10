# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a monorepo with three main applications:
- **`api/`** - Laravel 13 backend API
- **`web/`** - Vue.js 3 web frontend (standalone SPA)
- **`app/`** - React Native/Expo mobile application

## Development Commands

### API (Laravel) - Run from `api/` directory
```bash
composer dev          # Start full dev environment (server, queue, logs)
composer test         # Run PHPUnit tests
./vendor/bin/pint     # Format PHP code
php artisan serve     # Start development server
```

### Web (Vue.js) - Run from `web/` directory
```bash
npm install           # Install dependencies
npm run dev           # Start Vite dev server
npm run build         # Production build
npm run preview       # Preview production build
npm run test          # Run tests
```

### Mobile App (Expo) - Run from `app/` directory
```bash
pnpm start            # Start Expo dev server
pnpm ios              # Run on iOS simulator
pnpm android          # Run on Android emulator
pnpm test             # Run Jest tests
pnpm check-all        # Run lint, type-check, and tests
```

#### Environment-specific commands (mobile)
```bash
pnpm start:staging              # Start with staging env
pnpm prebuild:development       # Prebuild for development
pnpm build:development:ios      # EAS build for iOS dev
pnpm build:production:android   # EAS build for Android prod
```

## Architecture Overview

### API (`api/`)
Laravel 13 REST API handling vehicle finance and lease estimation.

**Key Models**: User, Profile, VehicleFinanceSheet, VehicleLeaseSheet, Announcement, Notification

**Tech Stack**: Laravel 13, PHP 8.3+, MySQL, Sanctum, PHPUnit

**Structure**:
- Controllers: `app/Http/Controllers/`
- Models: `app/Models/`
- API Routes: `routes/api.php`
- Auth Routes: `routes/auth.php`

### Web (`web/`)
Vue.js 3 standalone SPA that communicates with the Laravel API.

**Tech Stack**: Vue.js 3, Vue Router 5, Pinia 4, Vite 8, Tailwind CSS 4, TypeScript

**Structure** (`web/src/`):
```
api/          # API client layer (axios-based)
router/       # Vue Router configuration
stores/       # Pinia state management
pages/        # Page components
layouts/      # Layout components
components/   # Reusable Vue components
types/        # TypeScript types
utils/        # Utility functions
data/         # Static data
assets/       # CSS and static assets
```

**Environment Configuration**:
- `VITE_API_URL` - API base URL (defaults to `/api` for same-domain deployment)
- `VITE_SITE_URL` - Absolute site origin used for canonical URLs, Open Graph tags,
  and `sitemap.xml`. Defaults to `https://thefrugalist.io`.

**SEO and prerendering**:

The SPA's public pages are prerendered to static HTML at build time so crawlers and
social-card scrapers - neither of which reliably runs JavaScript - get real content
and per-page metadata.

- A route is public and indexable **only** if it carries `meta.seo` in
  `src/router/routes.ts`. That single flag drives the `<title>`/description/canonical/
  Open Graph tags, the JSON-LD, prerendering, and `sitemap.xml`. Routes without it
  resolve to `noindex, nofollow` and are omitted from the sitemap.
- Dynamic routes cannot be enumerated from their pattern, so they also declare
  `meta.seoPaths` with the concrete URLs to render.
- `pnpm build` runs three steps: the client build, an SSR build of
  `src/entry-server.ts`, then `scripts/prerender.mjs`, which writes
  `api/public/web/prerendered/` and `api/public/sitemap.xml`. A route that fails to
  render fails the build rather than silently shipping an empty page.
- Laravel serves a prerendered file when one exists for the request path, otherwise
  the SPA shell (`api/routes/web.php`). The client does a clean mount rather than
  hydrating - signed-in and signed-out chrome differ, so hydration would mismatch.
- Guides and calculators are public; saving an estimate still requires an account
  (`src/composables/useEstimateAccess.ts`). `src/router/__tests__/seo.spec.ts` locks
  that in - it fails if a public route slips back behind the auth guard.

### Mobile App (`app/`)
React Native/Expo application using the Obytes starter template.

**Tech Stack**: Expo SDK 57, React Native 0.86, TypeScript, Nativewind (Tailwind), Expo Router, React Query + React Query Kit, Zustand, Zod

**Structure** (`app/src/`):
```
api/          # API hooks using React Query Kit (auth, finance, lease, etc.)
app/          # Expo Router screens (file-based routing)
components/   # Shared components
  ui/         # Core UI components (buttons, inputs, etc.)
lib/          # Utilities, hooks, auth, i18n, storage, calculators
translations/ # i18n translation files
types/        # Shared TypeScript types
```

## Code Conventions

### Web (`web/`)
- Vue component order: script, template, styles
- Use absolute imports (`@/...`)
- Custom Tailwind with CSS variables for theming
- Rubik font family

### Mobile App (`app/`)
- Use `pnpm` as package manager; install packages with `npx expo install <package>`
- Use kebab-case for all file and directory names
- Favor named exports; use absolute imports (`@/...`)
- Use `type` over `interface`; avoid enums (use `as const`)
- Use functional components; prefer iteration over duplication
- Component files should not exceed 80 lines
- Test files: `component-name.test.tsx` (only test utilities and complex components)

### API (`api/`)
- Follow Laravel conventions
- Use Laravel Pint for code formatting

### Git Workflow
Always work on a branch — never commit directly to `main`. Follow git flow naming:

Branch off `staging`, not `main`. `staging` is the integration branch; `main` holds
released code only.

| Type | When | Branch name pattern |
|------|------|---------------------|
| `feature/` | New functionality | `feature/{N}-short-description` |
| `fix/` | Bug fix | `fix/{N}-short-description` |
| `hotfix/` | Urgent production fix | `hotfix/{N}-short-description` |
| `chore/` | Non-functional (deps, config, cleanup) | `chore/{N}-short-description` |
| `refactor/` | Code restructure without behaviour change | `refactor/{N}-short-description` |

`{N}` is the GitHub issue number. Example: `feature/12-web-code-quality-fixes`.

Issues and the project board live on GitHub (`barnettlabs/the-frugalist`). Legacy
`TEN-` identifiers in older commit messages refer to a retired tracker — ignore them.

After pushing the branch, open a GitHub PR into `staging` referencing the issue
number (for example `Closes #12`).

### Git Commits
Use conventional commits: `fix:`, `feat:`, `perf:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- Lowercase messages, max 100 characters
- Reference issue numbers when applicable
