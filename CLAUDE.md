# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a monorepo with three main applications:
- **`api/`** - Laravel 12 backend API
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
Laravel 12 REST API handling vehicle finance and lease estimation.

**Key Models**: User, Profile, VehicleFinanceSheet, VehicleLeaseSheet, Announcement, Notification

**Tech Stack**: Laravel 12, PHP 8.2+, MySQL, Sanctum, PHPUnit

**Structure**:
- Controllers: `app/Http/Controllers/`
- Models: `app/Models/`
- API Routes: `routes/api.php`
- Auth Routes: `routes/auth.php`

### Web (`web/`)
Vue.js 3 standalone SPA that communicates with the Laravel API.

**Tech Stack**: Vue.js 3, Vue Router, Pinia, Vite, Tailwind CSS, TypeScript

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

### Git Commits
Use conventional commits: `fix:`, `feat:`, `perf:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- Lowercase messages, max 100 characters
- Reference issue numbers when applicable
