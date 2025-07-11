<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VehicleFinanceSheetController;
use App\Http\Controllers\VehicleLeaseSheetController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\NotificationController;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
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

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function (Request $request) {
    $user = $request->user();
    $profile = $user->profile;

    // Get vehicle sheets for stats
    $vehicleFinanceSheets = $user->vehicleFinanceSheets()->latest()->get();
    $vehicleLeaseSheets = $user->vehicleLeaseSheets()->latest()->get();

    return Inertia::render('Dashboard', [
        'user' => $user,
        'profile' => $profile,
        'vehicleFinanceSheets' => $vehicleFinanceSheets,
        'vehicleLeaseSheets' => $vehicleLeaseSheets,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', function (Request $request) {
        $user = $request->user();
        $profile = $user->profile;

        return Inertia::render('Profile/Edit', [
            'user' => $user,
            'profile' => $profile,
            'mustVerifyEmail' => false,
            'status' => session('status'),
        ]);
    })->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Estimates routes
    Route::get('/estimates/financing', function (Request $request) {
        $user = $request->user();
        $profile = $user->profile;

        return Inertia::render('Estimates/Financing/Index', [
            'user' => $user,
            'profile' => $profile,
        ]);
    })->name('estimates.financing');

    Route::get('/estimates/financing/create', function (Request $request) {
        $user = $request->user();
        $profile = $user->profile;

        return Inertia::render('Estimates/Financing/Create', [
            'user' => $user,
            'profile' => $profile,
        ]);
    })->name('estimates.financing.create');

    Route::get('/estimates/financing/{sheet}/edit', function (Request $request, $sheet) {
        $user = $request->user();
        $profile = $user->profile;
        $vehicleFinanceSheet = $user->vehicleFinanceSheets()->findOrFail($sheet);

        return Inertia::render('Estimates/Financing/Edit', [
            'user' => $user,
            'profile' => $profile,
            'sheet' => $vehicleFinanceSheet,
        ]);
    })->name('estimates.financing.edit');

    Route::get('/estimates/leasing', function (Request $request) {
        $user = $request->user();
        $profile = $user->profile;

        return Inertia::render('Estimates/Leasing/Index', [
            'user' => $user,
            'profile' => $profile,
        ]);
    })->name('estimates.leasing');

    Route::get('/estimates/leasing/create', function (Request $request) {
        $user = $request->user();
        $profile = $user->profile;

        return Inertia::render('Estimates/Leasing/Create', [
            'user' => $user,
            'profile' => $profile,
        ]);
    })->name('estimates.leasing.create');

    Route::get('/estimates/leasing/{sheet}/edit', function (Request $request, $sheet) {
        $user = $request->user();
        $profile = $user->profile;
        $vehicleLeaseSheet = $user->vehicleLeaseSheets()->findOrFail($sheet);

        return Inertia::render('Estimates/Leasing/Edit', [
            'user' => $user,
            'profile' => $profile,
            'sheet' => $vehicleLeaseSheet,
        ]);
    })->name('estimates.leasing.edit');

    // Coming soon route
    Route::get('/coming-soon', function (Request $request) {
        $user = $request->user();
        $profile = $user->profile;

        return Inertia::render('ComingSoon', [
            'user' => $user,
            'profile' => $profile,
        ]);
    })->name('coming-soon');
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
});

// Public routes
Route::get('/api/announcements', [AnnouncementController::class, 'index']);
Route::get('/api/announcements/{announcement}', [AnnouncementController::class, 'show']);

require __DIR__.'/auth.php';
