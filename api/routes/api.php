<?php

use App\Http\Controllers\Admin\AiInvocationController;
use App\Http\Controllers\Admin\AiProviderController;
use App\Http\Controllers\Admin\AiRouteController;
use App\Http\Controllers\Admin\BugReportController;
use App\Http\Controllers\Admin\RetailerController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AiAgentController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\CalculatorController;
use App\Http\Controllers\MortgageSheetController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PlaygroundController;
use App\Http\Controllers\PriceTrackerController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserDeviceController;
use App\Http\Controllers\VehicleFinanceSheetController;
use App\Http\Controllers\VehicleLeaseSheetController;
use App\Http\Controllers\WatchDebugController;
use App\Models\Retailer;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Auth routes for mobile app
Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    // Create a token for the mobile app
    $token = $user->createToken('mobile-app')->plainTextToken;

    return response()->json([
        'user' => $user,
        'token' => $token,
    ]);
});

Route::post('/register', function (Request $request) {
    $request->validate([
        'first_name' => 'required|string|max:255',
        'last_name' => 'required|string|max:255',
        'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
        'password' => ['required', 'confirmed', Rules\Password::defaults()],
    ]);

    $user = User::create([
        'first_name' => $request->first_name,
        'last_name' => $request->last_name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
    ]);

    event(new Registered($user));

    // Create a token for the mobile app
    $token = $user->createToken('mobile-app')->plainTextToken;

    return response()->json([
        'user' => $user,
        'token' => $token,
    ]);
});

Route::post('/forgot-password', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
    ]);

    $status = Password::sendResetLink(
        $request->only('email')
    );

    if ($status === Password::RESET_LINK_SENT) {
        return response()->json([
            'message' => 'Password reset link sent to your email.',
        ]);
    }

    throw ValidationException::withMessages([
        'email' => [__($status)],
    ]);
});

Route::post('/reset-password', function (Request $request) {
    $request->validate([
        'token' => 'required',
        'email' => 'required|email',
        'password' => ['required', 'confirmed', Rules\Password::defaults()],
    ]);

    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function ($user) use ($request) {
            $user->forceFill([
                'password' => Hash::make($request->password),
            ])->save();
        }
    );

    if ($status === Password::PASSWORD_RESET) {
        return response()->json([
            'message' => 'Password has been reset successfully.',
        ]);
    }

    throw ValidationException::withMessages([
        'email' => [__($status)],
    ]);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Get current user
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Logout
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    });

    // Email verification
    Route::post('/email/verification-notification', function (Request $request) {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.',
            ]);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Verification link sent.',
        ]);
    })->middleware('throttle:6,1');

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);

    // Password update
    Route::put('/password', function (Request $request) {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    });

    // Dashboard stats
    Route::get('/dashboard/stats', function (Request $request) {
        $user = $request->user();
        $financeSheets = $user->vehicleFinanceSheets()->latest()->get();
        $leaseSheets = $user->vehicleLeaseSheets()->latest()->get();
        $mortgageSheets = $user->mortgageSheets()->latest()->get();
        $trackedProducts = $user->trackedProducts()->with('retailer')->latest()->get();

        return response()->json([
            'finance_sheets_count' => $financeSheets->count(),
            'lease_sheets_count' => $leaseSheets->count(),
            'mortgage_sheets_count' => $mortgageSheets->count(),
            'tracked_products_count' => $trackedProducts->count(),
            'recent_finance_sheets' => $financeSheets->take(3),
            'recent_lease_sheets' => $leaseSheets->take(3),
            'recent_mortgage_sheets' => $mortgageSheets->take(3),
            'recent_tracked_products' => $trackedProducts->take(3),
        ]);
    });

    // Vehicle Finance Sheets
    Route::apiResource('vehicle-finance-sheets', VehicleFinanceSheetController::class);

    // Vehicle Lease Sheets
    Route::apiResource('vehicle-lease-sheets', VehicleLeaseSheetController::class);

    // Mortgage Sheets
    Route::apiResource('mortgage-sheets', MortgageSheetController::class);

    // Watch (Price Tracker)
    Route::prefix('watch')->group(function () {
        Route::get('/', [PriceTrackerController::class, 'apiIndex']);
        Route::post('/validate-product', [PriceTrackerController::class, 'validateProduct']);
        Route::post('/', [PriceTrackerController::class, 'apiStore']);
        Route::get('/{trackedProduct}', [PriceTrackerController::class, 'apiShow']);
        Route::patch('/{trackedProduct}', [PriceTrackerController::class, 'apiUpdate']);
        Route::delete('/{trackedProduct}', [PriceTrackerController::class, 'apiDestroy']);
        Route::post('/{trackedProduct}/refresh', [PriceTrackerController::class, 'apiRefresh']);
    });

    // Watch Debug (separate endpoints for debugging retailer API calls)
    Route::prefix('watch-debug')->group(function () {
        Route::get('/can-debug', [WatchDebugController::class, 'canDebug']);
        Route::post('/validate-product', [WatchDebugController::class, 'validateProduct']);
        Route::post('/{trackedProduct}/refresh', [WatchDebugController::class, 'refresh']);
    });

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/{notification}', [NotificationController::class, 'show']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);

    // User Devices (Push Notifications)
    Route::apiResource('devices', UserDeviceController::class)->except(['show']);

    // AI agent invocation (deal grader, future chat, etc.)
    Route::post('/ai/agents/{slug}/run', [AiAgentController::class, 'run'])
        ->middleware('throttle:60,1');

    // Playground (Email Testing) - Local dev or admin only
    Route::prefix('playground')->group(function () {
        Route::get('/email-templates', [PlaygroundController::class, 'emailTemplates']);
        Route::post('/send-test-email', [PlaygroundController::class, 'sendTestEmail']);
        Route::post('/preview-email', [PlaygroundController::class, 'previewEmail']);
    })->middleware('can:access-playground');
});

// Admin routes (auth + admin gate)
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('retailers/available-slugs', [RetailerController::class, 'availableSlugs']);
    Route::apiResource('retailers', RetailerController::class);
    Route::apiResource('announcements', App\Http\Controllers\Admin\AnnouncementController::class);
    Route::get('users', [UserController::class, 'index']);
    Route::get('users/{user}', [UserController::class, 'show']);
    Route::patch('users/{user}', [UserController::class, 'update']);
    Route::apiResource('bug-reports', BugReportController::class)
        ->except(['store']);

    // AI admin
    Route::post('ai/providers/{provider}/test', [AiProviderController::class, 'test']);
    Route::get('ai/providers/{provider}/models', [AiProviderController::class, 'models']);
    Route::apiResource('ai/providers', AiProviderController::class);
    Route::post('ai/agents/{agent}/preview', [App\Http\Controllers\Admin\AiAgentController::class, 'preview']);
    Route::get('ai/agents/{agent}/versions', [App\Http\Controllers\Admin\AiAgentController::class, 'versions']);
    Route::post('ai/agents/{agent}/rollback/{version}', [App\Http\Controllers\Admin\AiAgentController::class, 'rollback']);
    Route::apiResource('ai/agents', App\Http\Controllers\Admin\AiAgentController::class);
    Route::apiResource('ai/routes', AiRouteController::class)->except(['show']);
    Route::get('ai/invocations', [AiInvocationController::class, 'index']);
    Route::get('ai/invocations/{invocation}', [AiInvocationController::class, 'show']);
});

// Calculators (public - same compute used by UI and AI agents)
Route::post('/calculators/finance/compute', [CalculatorController::class, 'finance']);
Route::post('/calculators/lease/compute', [CalculatorController::class, 'lease']);
Route::post('/calculators/mortgage/compute', [CalculatorController::class, 'mortgage']);

// Public routes (no auth required)
Route::get('/announcements', [AnnouncementController::class, 'index']);
Route::get('/announcements/{announcement}', [AnnouncementController::class, 'show']);

// Retailers (public - for displaying available stores)
Route::get('/retailers', function () {
    return response()->json([
        'retailers' => Retailer::orderBy('name')->get(),
    ]);
});
