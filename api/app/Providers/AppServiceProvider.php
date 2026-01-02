<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Gate for playground access - local dev or admin email
        Gate::define('access-playground', function (User $user) {
            // Allow in local/development environment
            if (app()->environment(['local', 'development'])) {
                return true;
            }

            // Allow admin email
            $adminEmail = config('app.admin_email');
            if ($adminEmail && $user->email === $adminEmail) {
                return true;
            }

            return false;
        });
    }
}
