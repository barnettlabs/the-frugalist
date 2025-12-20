<?php

use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Auth Routes
|--------------------------------------------------------------------------
|
| These routes handle web-based authentication flows that can't be done
| via the API (like email verification links). The Vue SPA handles all
| other auth UI and uses the API routes for authentication.
|
*/

Route::middleware('auth')->group(function () {
    // Email verification - this needs to be a web route because it's clicked from an email
    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
});
