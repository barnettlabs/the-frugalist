<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_can_be_requested(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/forgot-password', ['email' => $user->email])
            ->assertOk()
            ->assertJsonPath('message', 'Password reset link sent to your email.');

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_reset_link_request_fails_for_unknown_email(): void
    {
        Notification::fake();

        $this->postJson('/api/forgot-password', ['email' => 'nobody@example.com'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');

        Notification::assertNothingSent();
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
            $this->postJson('/api/reset-password', [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ])->assertOk()->assertJsonPath('message', 'Password has been reset successfully.');

            $this->assertTrue(Hash::check('NewPassword123!', $user->refresh()->password));

            return true;
        });
    }

    public function test_password_can_not_be_reset_with_invalid_token(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/reset-password', [
            'token' => 'invalid-token',
            'email' => $user->email,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])->assertStatus(422)->assertJsonValidationErrors('email');

        $this->assertTrue(Hash::check('password', $user->refresh()->password));
    }
}
