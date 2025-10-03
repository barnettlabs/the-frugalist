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
            // $environment = app()->environment();

            // In local environment, allow all authenticated users
            // if ($environment === 'local') {
            //     return $user !== null;
            // }

            // Get admin emails from config (which is loaded after service providers)
            // $adminEmails = collect(config('services.horizon.admin_emails', []))
            //     ->map(fn($email) => strtolower(trim($email)))
            //     ->filter()
            //     ->toArray();

            $aa = env('HORIZON_ADMIN_EMAILS', '');
            $bb = config('services.horizon.admin_emails', []);

            logger('viewHorizon', [
                'aa' => $aa,
                'bb' => $bb,
                // 'adminEmails' => $adminEmails,
            ]);

            $adminEmails = array_map(
                'strtolower',
                array_map('trim', config('services.horizon.admin_emails', []))
            );

            // In production, only allow specific admin emails
            // $adminEmails = explode(',', env('HORIZON_ADMIN_EMAILS', ''));
            $isAdmin = $user && in_array($user->email, $adminEmails);

            logger('viewHorizon', [
                'user' => $user,
                'environment' => app()->environment(),
                'adminEmails' => $adminEmails,
                'isAdmin' => $isAdmin,
            ]);

            return $isAdmin;
        });
    }
}
