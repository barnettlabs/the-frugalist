<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    private function verificationUrl(User $user, ?string $email = null): string
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($email ?? $user->email)]
        );
    }

    public function test_email_can_be_verified(): void
    {
        $user = User::factory()->unverified()->create();

        Event::fake();

        $response = $this->actingAs($user)->get($this->verificationUrl($user));

        Event::assertDispatched(Verified::class);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $response->assertRedirect(route('verification.success'));
    }

    /**
     * Regression: VerifyEmailController redirects to route('verification.success').
     * That route did not exist, so every click on a real verification email
     * raised RouteNotFoundException and returned a 500.
     */
    public function test_verification_success_route_resolves_and_lands_in_the_spa(): void
    {
        $this->assertTrue(Route::has('verification.success'));

        $this->get(route('verification.success'))
            ->assertRedirect('/login?verified=1');
    }

    /**
     * Regression: the `auth` middleware redirects guests to route('login').
     * Without a named login route that also raised RouteNotFoundException.
     */
    public function test_guest_clicking_a_verification_link_is_redirected_to_login(): void
    {
        $user = User::factory()->unverified()->create();

        $this->get($this->verificationUrl($user))->assertRedirect(route('login'));
    }

    public function test_already_verified_user_is_redirected_without_reverifying(): void
    {
        $user = User::factory()->create();

        Event::fake();

        $this->actingAs($user)
            ->get($this->verificationUrl($user))
            ->assertRedirect(route('verification.success'));

        Event::assertNotDispatched(Verified::class);
    }

    public function test_email_is_not_verified_with_invalid_hash(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)->get($this->verificationUrl($user, 'wrong-email'));

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }
}
