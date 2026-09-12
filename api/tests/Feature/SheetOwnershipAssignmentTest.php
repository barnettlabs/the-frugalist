<?php

namespace Tests\Feature;

use App\Models\MortgageSheet;
use App\Models\User;
use App\Models\VehicleFinanceSheet;
use App\Models\VehicleLeaseSheet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Regression tests for a mass-assignment hole in the three sheet controllers.
 *
 * user_id is in $fillable on all three models, and the controllers called
 * fill($request->all()) *after* assigning user_id from the authenticated user.
 * A request body carrying its own user_id therefore won the race:
 *
 *   POST /api/vehicle-finance-sheets  {"user_id": 3, ...}
 *     -> created a sheet owned by user 3, whoever was authenticated.
 *
 *   PUT /api/vehicle-finance-sheets/1 {"user_id": 3}
 *     -> moved the caller's own sheet into another account.
 *
 * Both were confirmed against the running application. The ownership *checks*
 * were correct throughout - this was the assignment that undermined them, which
 * is why no existing test caught it.
 */
class SheetOwnershipAssignmentTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private User $victim;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->victim = User::factory()->create();
    }

    /** @return array<string, array{string, class-string, array<string, mixed>}> */
    public static function sheetProvider(): array
    {
        return [
            'finance' => [
                'vehicle-finance-sheets',
                VehicleFinanceSheet::class,
                ['sheet_name' => 'Probe', 'msrp' => 1000],
            ],
            'lease' => [
                'vehicle-lease-sheets',
                VehicleLeaseSheet::class,
                ['sheet_name' => 'Probe', 'msrp' => 1000],
            ],
            'mortgage' => [
                'mortgage-sheets',
                MortgageSheet::class,
                ['sheet_name' => 'Probe', 'property_value' => 250000],
            ],
        ];
    }

    /**
     * @param  class-string  $model
     * @param  array<string, mixed>  $payload
     */
    #[DataProvider('sheetProvider')]
    public function test_store_ignores_a_user_id_in_the_request(
        string $endpoint,
        string $model,
        array $payload
    ): void {
        $response = $this->actingAs($this->user)
            ->postJson("/api/{$endpoint}", $payload + ['user_id' => $this->victim->id]);

        $response->assertCreated();

        $sheet = $model::findOrFail($response->json('id'));

        $this->assertSame(
            $this->user->id,
            $sheet->user_id,
            'the sheet must belong to the authenticated user, not the id supplied in the body'
        );
    }

    /**
     * @param  class-string  $model
     * @param  array<string, mixed>  $payload
     */
    #[DataProvider('sheetProvider')]
    public function test_update_cannot_transfer_a_sheet_to_another_user(
        string $endpoint,
        string $model,
        array $payload
    ): void {
        $sheet = $model::factory()->create(['user_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->putJson("/api/{$endpoint}/{$sheet->id}", $payload + ['user_id' => $this->victim->id])
            ->assertOk();

        $this->assertSame(
            $this->user->id,
            $sheet->fresh()->user_id,
            'ownership must not be reassignable through the update payload'
        );
    }

    /**
     * @param  class-string  $model
     * @param  array<string, mixed>  $payload
     */
    #[DataProvider('sheetProvider')]
    public function test_other_fields_still_update_normally(
        string $endpoint,
        string $model,
        array $payload
    ): void {
        // The fix filters exactly one key, so the ordinary path has to keep working.
        $sheet = $model::factory()->create(['user_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->putJson("/api/{$endpoint}/{$sheet->id}", ['sheet_name' => 'Renamed'])
            ->assertOk();

        $this->assertSame('Renamed', $sheet->fresh()->sheet_name);
    }
}
