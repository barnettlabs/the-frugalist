<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule price checking and notifications
Schedule::command('prices:check')->hourly()->name('price-check-hourly')->withoutOverlapping();
Schedule::command('prices:check --limit=100')->twiceDaily(9, 21)->name('price-check-twice-daily')->withoutOverlapping();

// Send notifications for price alerts every 15 minutes
Schedule::command('notifications:send-price-alerts')->everyFifteenMinutes()->name('send-price-notifications')->withoutOverlapping();
