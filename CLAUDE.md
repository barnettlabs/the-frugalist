# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a monorepo with two main applications:
- **`api/`** - Laravel 12 backend + Vue.js 3 web frontend (Inertia.js)
- **`app/`** - React Native/Expo mobile application

See `api/CLAUDE.md` for detailed API/web frontend documentation.

## Development Commands

### API (Laravel + Vue.js) - Run from `api/` directory
```bash
composer dev          # Start full dev environment (server, queue, logs, vite)
composer test         # Run PHPUnit tests
./vendor/bin/pint     # Format PHP code
npm run dev           # Vite dev server only
npm run build         # Production build
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
Laravel 12 application with Vue.js 3 frontend using Inertia.js. Handles vehicle finance and lease estimation.

**Key Models**: User, Profile, VehicleFinanceSheet, VehicleLeaseSheet, Announcement, Notification

**Tech Stack**: Laravel 12, PHP 8.2+, MySQL, Vue.js 3, Inertia.js, Vite, Tailwind CSS, Sanctum, PHPUnit

**Structure**:
- Controllers: `app/Http/Controllers/`
- Models: `app/Models/`
- Vue Pages: `resources/js/Pages/`
- Vue Components: `resources/js/Components/`
- Routes: `routes/web.php`

### Mobile App (`app/`)
React Native/Expo application using the Obytes starter template.

**Tech Stack**: Expo SDK 53, React Native 0.79, TypeScript, Nativewind (Tailwind), Expo Router, React Query + React Query Kit, Zustand, Zod

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

### Mobile App (`app/`)
- Use `pnpm` as package manager; install packages with `npx expo install <package>`
- Use kebab-case for all file and directory names
- Favor named exports; use absolute imports (`@/...`)
- Use `type` over `interface`; avoid enums (use `as const`)
- Use functional components; prefer iteration over duplication
- Component files should not exceed 80 lines
- Test files: `component-name.test.tsx` (only test utilities and complex components)
- Vue components: script at top, then template, then styles

### API (`api/`)
- Vue component order: script, template, styles
- Custom Tailwind with CSS variables for theming
- Rubik font family

### Git Commits
Use conventional commits: `fix:`, `feat:`, `perf:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- Lowercase messages, max 100 characters
- Reference issue numbers when applicable
