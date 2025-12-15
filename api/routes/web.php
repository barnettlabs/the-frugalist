<?php

use App\Http\Controllers\BugReportController;
use App\Http\Controllers\PhoneVerificationController;
use App\Http\Controllers\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// API-like routes that need session handling
Route::middleware('auth')->group(function () {
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Phone verification routes
    Route::post('/phone-verification/send', [PhoneVerificationController::class, 'sendCode'])->name('phone-verification.send');
    Route::post('/phone-verification/verify', [PhoneVerificationController::class, 'verifyCode'])->name('phone-verification.verify');
    Route::post('/phone-verification/resend', [PhoneVerificationController::class, 'resendCode'])->name('phone-verification.resend');
});

// Bug report route
Route::post('/bug-reports', [BugReportController::class, 'store'])->name('bug-reports.store');

// Well-known routes for app deep linking
Route::get('/.well-known/apple-app-site-association', function () {
    return response()->file(
        public_path('.well-known/apple-app-site-association'),
        ['Content-Type' => 'application/json']
    );
});

Route::get('/.well-known/assetlinks.json', function () {
    return response()->file(
        public_path('.well-known/assetlinks.json'),
        ['Content-Type' => 'application/json']
    );
});

require __DIR__ . '/auth.php';
