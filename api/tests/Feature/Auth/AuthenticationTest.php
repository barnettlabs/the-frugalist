<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * The SPA and mobile app both authenticate against the token-based API, not
 * the session-based web routes Breeze originally scaffolded.
 */
class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_authenticate_and_receive_a_token(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['user' => ['id', 'email'], 'token'])
            ->assertJsonPath('user.id', $user->id);

        $this->assertNotEmpty($response->json('token'));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_login_requires_email_and_password(): void
    {
        $this->postJson('/api/login', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_issued_token_grants_access_to_protected_routes(): void
    {
        $user = User::factory()->create();

        $token = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->json('token');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('id', $user->id);
    }

    public function test_guests_can_not_access_protected_routes(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $token = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->json('token');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/logout')
            ->assertOk();

        // Assert the token row is gone rather than re-requesting with it: the
        // auth guard caches the resolved user for the lifetime of a single
        // test process, so a follow-up request would still succeed in-process
        // even though the credential is revoked for real clients.
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_logout_deletes_only_the_current_access_token(): void
    {
        $user = User::factory()->create();
        $keep = $user->createToken('other-device')->plainTextToken;

        Sanctum::actingAs($user);
        $this->postJson('/api/logout')->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 1);
        $this->assertNotEmpty($keep);
    }
}
