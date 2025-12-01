<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Laravel\Horizon\Horizon;
use Laravel\Horizon\HorizonApplicationServiceProvider;

class HorizonServiceProvider extends HorizonApplicationServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        parent::boot();

        // Disable Horizon's built-in local environment bypass
        Horizon::auth(function ($request) {
            return Gate::allows('viewHorizon', $request->user());
        });

        // Horizon::routeSmsNotificationsTo('15556667777');
        // Horizon::routeMailNotificationsTo('example@example.com');
        // Horizon::routeSlackNotificationsTo('slack-webhook-url', '#channel');
    }

    /**
     * Register the Horizon gate.
     *
     * This gate determines who can access Horizon in non-local environments.
     */
    protected function gate(): void
    {
        Gate::define('viewHorizon', function ($user = null) {
            $environment = app()->environment();

            // In local environment, allow all authenticated users
            if ($environment === 'local') {
                return $user !== null;
            }

            $adminEmails = config('services.horizon.admin_emails', []);

            $adminEmails = array_map(
                'strtolower',
                array_map('trim', $adminEmails)
            );

            $isAdmin = $user && in_array($user->email, $adminEmails);

            return $isAdmin;
        });
    }
}
