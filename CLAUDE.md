# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (Laravel)
- `composer dev` - Start development server with queue worker, logs, and Vite
- `composer test` - Run PHPUnit tests with config clearing
- `php artisan test` - Run Laravel tests directly
- `php artisan serve` - Start PHP development server
- `php artisan migrate` - Run database migrations
- `php artisan db:seed` - Seed database with sample data
- `./vendor/bin/pint` - Run Laravel Pint code formatter

### Frontend (Vue.js + Vite)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npx vite` - Start Vite directly

### Database
- Uses MySQL for development
- Migrations located in database/migrations/
- Seeders in database/seeders/

## Architecture Overview

This is a Laravel 12 application with Vue.js 3 frontend using Inertia.js for seamless SPA experience. The application is designed for vehicle finance and lease estimation.

### Tech Stack
- **Backend**: Laravel 12, PHP 8.2+, MySQL
- **Frontend**: Vue.js 3, Inertia.js, Vite
- **Styling**: Tailwind CSS with custom color system
- **Authentication**: Laravel Breeze with Sanctum
- **Testing**: PHPUnit

### Key Models
- **User**: Base user model with profile relationship
- **Profile**: Extended user information
- **VehicleFinanceSheet**: Vehicle financing calculations
- **VehicleLeaseSheet**: Vehicle leasing calculations
- **Announcement**: System announcements
- **Notification**: User notifications

### Application Structure
- **Controllers**: Standard Laravel controllers in `app/Http/Controllers/`
- **Models**: Eloquent models in `app/Models/`
- **Views**: Inertia.js pages in `resources/js/Pages/`
- **Components**: Vue components in `resources/js/Components/`
- **Routes**: Web routes in `routes/web.php`, API routes defined inline

### Frontend Architecture
- **Layouts**: `AuthenticatedLayout.vue` and `GuestLayout.vue`
- **Pages**: Organized by feature (Auth, Profile, Estimates)
- **Components**: Reusable Vue components with consistent styling
- **Styling**: Custom Tailwind config with CSS variables for theming

### Key Features
- User authentication and profiles
- Vehicle finance estimate creation and editing
- Vehicle lease estimate creation and editing
- Responsive design with custom color system
- API endpoints for mobile/external access

### API Structure
- REST API endpoints under `/api/` prefix
- Sanctum authentication for API routes
- Public announcement endpoints
- Authenticated user-specific resources

### Custom Tailwind Configuration
- Custom color system using CSS variables
- Primary color variants (shades and tints)
- Custom font family (Rubik)
- Safelist patterns for dynamic classes

### Database Design
- User profiles are separate from users for extensibility
- Vehicle sheets have polymorphic structure for finance/lease types
- Shareable keys for external access to estimates
- JSON fields for flexible data (extra_payments_json)
