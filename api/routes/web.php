<?php

use App\Http\Controllers\BugReportController;
use App\Http\Controllers\PhoneVerificationController;
use App\Http\Controllers\ProfileController;
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

require __DIR__.'/auth.php';

/*
 * Serves the built Vue SPA. Shared by the catch-all below and by the named
 * routes that framework redirects target.
 */
$serveSpa = function () {
    $indexPath = public_path('web/index.html');

    if (! file_exists($indexPath)) {
        abort(404, 'Vue app not built. Run "npm run build" in the web directory.');
    }

    return response()->file($indexPath, [
        'Content-Type' => 'text/html',
    ]);
};

/*
 * Named SPA entry points.
 *
 * The framework resolves these by name, not by path: the `auth` middleware
 * redirects guests to route('login'), and VerifyEmailController redirects to
 * route('verification.success'). Without them Laravel throws
 * RouteNotFoundException and returns a 500 - which is what happened to every
 * user who clicked the link in their verification email.
 */
Route::get('/login', $serveSpa)->name('login');

Route::get('/email-verified', function () {
    return redirect('/login?verified=1');
})->name('verification.success');

// Catch-all route for Vue SPA - serves the built Vue app for all non-API routes
Route::get('/{any?}', $serveSpa)->where('any', '^(?!api|sanctum|web).*$');
