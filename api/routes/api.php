<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PriceTrackerController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VehicleFinanceSheetController;
use App\Http\Controllers\VehicleLeaseSheetController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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

    event(new \Illuminate\Auth\Events\Registered($user));

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

    $status = \Illuminate\Support\Facades\Password::sendResetLink(
        $request->only('email')
    );

    if ($status === \Illuminate\Support\Facades\Password::RESET_LINK_SENT) {
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

    $status = \Illuminate\Support\Facades\Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function ($user) use ($request) {
            $user->forceFill([
                'password' => Hash::make($request->password),
            ])->save();
        }
    );

    if ($status === \Illuminate\Support\Facades\Password::PASSWORD_RESET) {
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
        $trackedProducts = $user->trackedProducts()->with('retailer')->latest()->get();

        return response()->json([
            'finance_sheets_count' => $financeSheets->count(),
            'lease_sheets_count' => $leaseSheets->count(),
            'tracked_products_count' => $trackedProducts->count(),
            'recent_finance_sheets' => $financeSheets->take(3),
            'recent_lease_sheets' => $leaseSheets->take(3),
            'recent_tracked_products' => $trackedProducts->take(3),
        ]);
    });

    // Vehicle Finance Sheets
    Route::apiResource('vehicle-finance-sheets', VehicleFinanceSheetController::class);

    // Vehicle Lease Sheets
    Route::apiResource('vehicle-lease-sheets', VehicleLeaseSheetController::class);

    // Price Tracker
    Route::prefix('price-tracker')->group(function () {
        Route::get('/', [PriceTrackerController::class, 'apiIndex']);
        Route::post('/validate-product', [PriceTrackerController::class, 'validateProduct']);
        Route::post('/', [PriceTrackerController::class, 'apiStore']);
        Route::get('/{trackedProduct}', [PriceTrackerController::class, 'apiShow']);
        Route::patch('/{trackedProduct}', [PriceTrackerController::class, 'apiUpdate']);
        Route::delete('/{trackedProduct}', [PriceTrackerController::class, 'apiDestroy']);
        Route::post('/{trackedProduct}/refresh', [PriceTrackerController::class, 'apiRefresh']);
    });

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/{notification}', [NotificationController::class, 'show']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
});

// Public routes (no auth required)
Route::get('/announcements', [AnnouncementController::class, 'index']);
Route::get('/announcements/{announcement}', [AnnouncementController::class, 'show']);
