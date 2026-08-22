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

require __DIR__.'/auth.php';

/*
 * Crawler files.
 *
 * Both live in public/ and are normally served straight off disk by the web
 * server. These routes exist because the SPA catch-all below would otherwise
 * answer them with HTML if that ever stopped being true - a silently broken
 * sitemap is hard to notice.
 */
Route::get('/sitemap.xml', function () {
    $path = public_path('sitemap.xml');

    abort_unless(is_file($path), 404, 'Sitemap not generated. Run the web build.');

    return response()->file($path, [
        'Content-Type' => 'application/xml',
    ]);
});

Route::get('/robots.txt', function () {
    return response()->file(public_path('robots.txt'), [
        'Content-Type' => 'text/plain',
    ]);
});

/*
 * Catch-all route for Vue SPA - serves the built Vue app for all non-API routes.
 *
 * Public routes are prerendered to static HTML during the web build
 * (web/scripts/prerender.mjs) so crawlers and social-card scrapers - neither of
 * which reliably runs JavaScript - get real content and per-page metadata
 * instead of an empty <div id="app">. Where a prerendered file exists for the
 * requested path it is served in place of the shell. The SPA boots identically
 * either way, so behaviour in the browser is unchanged.
 */
Route::get('/{any?}', function (Request $request) {
    $path = trim($request->path(), '/');

    // The path is used to build a filename, so allow only the characters the
    // Vue router can actually produce. This rules out traversal outright.
    if ($path === '' || preg_match('/^[A-Za-z0-9\-_\/]+$/', $path)) {
        $prerendered = public_path('web/prerendered/'.($path === '' ? 'index' : $path).'.html');

        if (is_file($prerendered)) {
            return response()->file($prerendered, [
                'Content-Type' => 'text/html',
            ]);
        }
    }

    $indexPath = public_path('web/index.html');

    if (! file_exists($indexPath)) {
        abort(404, 'Vue app not built. Run "npm run build" in the web directory.');
    }

    return response()->file($indexPath, [
        'Content-Type' => 'text/html',
    ]);
})->where('any', '^(?!api|sanctum|web).*$');
