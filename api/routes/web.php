<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\BugReportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PhoneVerificationController;
use App\Http\Controllers\PriceTrackerController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VehicleFinanceSheetController;
use App\Http\Controllers\VehicleLeaseSheetController;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

Route::get('/', function (Request $request) {
    $user = $request->user();

    if ($user) {
        // User is authenticated, show dashboard
        $vehicleFinanceSheets = $user->vehicleFinanceSheets()->latest()->get();
        $vehicleLeaseSheets = $user->vehicleLeaseSheets()->latest()->get();

        return Inertia::render('Dashboard', [
            'user' => $user,
            'vehicleFinanceSheets' => $vehicleFinanceSheets,
            'vehicleLeaseSheets' => $vehicleLeaseSheets,
        ]);
    } else {
        // User is not authenticated, show welcome page
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }
});

Route::get('/dashboard', function (Request $request) {
    $user = $request->user();

    // Get vehicle sheets for stats
    $vehicleFinanceSheets = $user->vehicleFinanceSheets()->latest()->get();
    $vehicleLeaseSheets = $user->vehicleLeaseSheets()->latest()->get();

    return Inertia::render('Dashboard', [
        'user' => $user,
        'vehicleFinanceSheets' => $vehicleFinanceSheets,
        'vehicleLeaseSheets' => $vehicleLeaseSheets,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', function (Request $request) {
        $user = $request->user();

        return Inertia::render('Profile/Edit', [
            'user' => $user,
            'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
            'status' => session('status'),
        ]);
    })->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Phone verification routes
    Route::post('/phone-verification/send', [PhoneVerificationController::class, 'sendCode'])->name('phone-verification.send');
    Route::post('/phone-verification/verify', [PhoneVerificationController::class, 'verifyCode'])->name('phone-verification.verify');
    Route::post('/phone-verification/resend', [PhoneVerificationController::class, 'resendCode'])->name('phone-verification.resend');

    // Estimates routes
    Route::get('/estimates/financing', function (Request $request) {
        $user = $request->user();

        return Inertia::render('Estimates/Financing/Index', [
            'user' => $user,
        ]);
    })->name('estimates.financing');

    Route::get('/estimates/financing/create', function (Request $request) {
        $user = $request->user();

        return Inertia::render('Estimates/Financing/Details', [
            'user' => $user,
        ]);
    })->name('estimates.financing.create');

    Route::get('/estimates/financing/{sheet}/edit', function (Request $request, $sheet) {
        $user = $request->user();
        $vehicleFinanceSheet = $user->vehicleFinanceSheets()->findOrFail($sheet);

        return Inertia::render('Estimates/Financing/Details', [
            'user' => $user,
            'sheet' => $vehicleFinanceSheet,
        ]);
    })->name('estimates.financing.edit');

    Route::get('/estimates/leasing', function (Request $request) {
        $user = $request->user();

        return Inertia::render('Estimates/Leasing/Index', [
            'user' => $user,
        ]);
    })->name('estimates.leasing');

    Route::get('/estimates/leasing/create', function (Request $request) {
        $user = $request->user();

        return Inertia::render('Estimates/Leasing/Details', [
            'user' => $user,
        ]);
    })->name('estimates.leasing.create');

    Route::get('/estimates/leasing/{sheet}/edit', function (Request $request, $sheet) {
        $user = $request->user();
        $vehicleLeaseSheet = $user->vehicleLeaseSheets()->findOrFail($sheet);

        return Inertia::render('Estimates/Leasing/Details', [
            'user' => $user,
            'sheet' => $vehicleLeaseSheet,
        ]);
    })->name('estimates.leasing.edit');

    // Comparison routes
    Route::get('/estimates/financing/compare', function (Request $request) {
        $user = $request->user();
        $sheetIds = $request->query('sheets', '');

        return Inertia::render('Estimates/Financing/Compare', [
            'user' => $user,
            'sheetIds' => $sheetIds,
        ]);
    })->name('estimates.financing.compare');

    Route::get('/estimates/leasing/compare', function (Request $request) {
        $user = $request->user();
        $sheetIds = $request->query('sheets', '');

        return Inertia::render('Estimates/Leasing/Compare', [
            'user' => $user,
            'sheetIds' => $sheetIds,
        ]);
    })->name('estimates.leasing.compare');

    // Coming soon route
    Route::get('/coming-soon', function (Request $request) {
        $user = $request->user();

        return Inertia::render('ComingSoon', [
            'user' => $user,
        ]);
    })->name('coming-soon');

    // Disclaimers route
    Route::get('/disclaimers', function (Request $request) {
        $user = $request->user();

        return Inertia::render('Disclaimers', [
            'user' => $user,
        ]);
    })->name('disclaimers');

    // Learning routes
    Route::get('/learning/financing', function (Request $request) {
        $user = $request->user();

        return Inertia::render('Learning/Show', [
            'user' => $user,
            'tool' => 'financing',
        ]);
    })->name('learning.financing');

    Route::get('/learning/leasing', function (Request $request) {
        $user = $request->user();

        return Inertia::render('Learning/Show', [
            'user' => $user,
            'tool' => 'leasing',
        ]);
    })->name('learning.leasing');
});

// API Routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Profile routes
    Route::get('/api/profile', [ProfileController::class, 'show']);
    Route::put('/api/profile', [ProfileController::class, 'update']);

    // Vehicle Finance Sheets
    Route::apiResource('/api/vehicle-finance-sheets', VehicleFinanceSheetController::class);

    // Vehicle Lease Sheets
    Route::apiResource('/api/vehicle-lease-sheets', VehicleLeaseSheetController::class);

    // Notifications
    Route::get('/api/notifications', [NotificationController::class, 'index']);
    Route::get('/api/notifications/{notification}', [NotificationController::class, 'show']);

    // Price Tracker routes
    Route::prefix('price-tracker')->name('price-tracker.')->group(function () {
        Route::get('/', [PriceTrackerController::class, 'index'])->name('index');
        Route::get('/create', [PriceTrackerController::class, 'create'])->name('create');
        Route::post('/validate-product', [PriceTrackerController::class, 'validateProduct'])->name('validate-product');
        Route::post('/', [PriceTrackerController::class, 'store'])->name('store');
        Route::get('/{trackedProduct}', [PriceTrackerController::class, 'show'])->name('show');
        Route::patch('/{trackedProduct}', [PriceTrackerController::class, 'update'])->name('update');
        Route::delete('/{trackedProduct}', [PriceTrackerController::class, 'destroy'])->name('destroy');
        Route::post('/{trackedProduct}/refresh', [PriceTrackerController::class, 'refresh'])->name('refresh');
    });
});

// Public routes
Route::get('/api/announcements', [AnnouncementController::class, 'index']);
Route::get('/api/announcements/{announcement}', [AnnouncementController::class, 'show']);

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

// debugging
// Route::get('/test/email-preview', function () {
//     $trackedProduct = \App\Models\TrackedProduct::with('retailer')->first();

//     return new \App\Mail\PriceDropAlert($trackedProduct, 'target_reached');
// })->middleware('auth');

require __DIR__ . '/auth.php';
