# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (Laravel)
- `composer dev` - Start development server with queue worker and logs
- `composer test` - Run PHPUnit tests with config clearing
- `php artisan test` - Run Laravel tests directly
- `php artisan serve` - Start PHP development server
- `php artisan migrate` - Run database migrations
- `php artisan db:seed` - Seed database with sample data
- `./vendor/bin/pint` - Run Laravel Pint code formatter

### Database
- Uses MySQL for development
- Migrations located in database/migrations/
- Seeders in database/seeders/

## Architecture Overview

This is a Laravel 12 REST API for vehicle finance and lease estimation. The frontend is a separate Vue.js SPA in the `web/` folder.

### Tech Stack
- **Backend**: Laravel 12, PHP 8.2+, MySQL
- **Authentication**: Laravel Sanctum (token-based)
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
- **API Routes**: `routes/api.php`
- **Auth Routes**: `routes/auth.php`
- **Web Routes**: `routes/web.php` (minimal, mostly for well-known files)

### Key Features
- User authentication and profiles (token-based via Sanctum)
- Vehicle finance estimate CRUD
- Vehicle lease estimate CRUD
- Price tracker functionality
- Public announcement endpoints

### API Structure
- REST API endpoints under `/api/` prefix
- Sanctum authentication for protected routes
- Public endpoints: announcements, auth (login, register)
- Authenticated endpoints: user, profile, dashboard, finance sheets, lease sheets, price tracker

### Database Design
- User profiles are separate from users for extensibility
- Vehicle sheets have polymorphic structure for finance/lease types
- Shareable keys for external access to estimates
- JSON fields for flexible data (extra_payments_json)
