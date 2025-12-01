<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * API endpoint to show profile.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'username' => $user->username,
            'avatar_url' => $user->avatar_url,
            'website' => $user->website,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
        ]);
    }

    /**
     * Update the user's profile information.
     * Handles both web (redirect) and API (JSON) requests.
     */
    public function update(ProfileUpdateRequest $request)
    {
        $user = $request->user();
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        // Return JSON for API requests
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'username' => $user->username,
                'avatar_url' => $user->avatar_url,
                'website' => $user->website,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
            ]);
        }

        // Return redirect for web requests
        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
