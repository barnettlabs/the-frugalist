<?php

namespace App\Http\Controllers;

use App\Models\PhoneVerificationCode;
use App\Services\TwilioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class PhoneVerificationController extends Controller
{
    public function sendCode(Request $request, TwilioService $twilioService)
    {
        $request->validate([
            'phone_number' => ['required', 'string', 'max:20'],
        ]);

        $user = Auth::user();
        $phoneNumber = $request->phone_number;

        // Generate a 6-digit verification code
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Invalidate any existing codes for this user and phone number
        PhoneVerificationCode::where('user_id', $user->id)
            ->where('phone_number', $phoneNumber)
            ->delete();

        // Create new verification code
        $verification = PhoneVerificationCode::create([
            'user_id' => $user->id,
            'phone_number' => $phoneNumber,
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
        ]);

        // SMS TEMPORARILY DISABLED - waiting for Twilio approval
        // Send SMS with code using Twilio
        // $twilioService->sendVerificationCode($phoneNumber, $code);

        return back()->with('status', 'verification-code-sent');
    }

    public function verifyCode(Request $request)
    {
        $request->validate([
            'phone_number' => ['required', 'string', 'max:20'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = Auth::user();

        $verification = PhoneVerificationCode::where('user_id', $user->id)
            ->where('phone_number', $request->phone_number)
            ->where('code', $request->code)
            ->whereNull('verified_at')
            ->first();

        if (! $verification) {
            throw ValidationException::withMessages([
                'code' => ['The verification code is invalid.'],
            ]);
        }

        if ($verification->isExpired()) {
            throw ValidationException::withMessages([
                'code' => ['The verification code has expired.'],
            ]);
        }

        // Mark code as verified
        $verification->update(['verified_at' => now()]);

        // Update user's phone number and verification status
        $user->update([
            'phone_number' => $request->phone_number,
            'phone_verified_at' => now(),
        ]);

        return back()->with('status', 'phone-verified');
    }

    public function resendCode(Request $request)
    {
        return $this->sendCode($request);
    }
}
