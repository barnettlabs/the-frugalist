<?php

namespace Tests\Feature;

use App\Models\MortgageSheet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MortgageSheetTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_create_mortgage_sheet(): void
    {
        $data = [
            'sheet_name' => 'Test Mortgage',
            'property_address' => '123 Main St',
            'property_type' => 'HOUSE',
            'property_value' => 400000.00,
            'down_payment' => 80000.00,
            'interest_rate' => 6.5,
            'loan_term_years' => 30,
            'annual_property_tax' => 6000,
            'annual_insurance' => 1200,
            'monthly_hoa' => 150,
            'contact_email' => 'test@example.com',
            'contact_phone' => '555-0123',
            'notes' => 'Test notes',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('mortgage-sheets.store'), $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('mortgage_sheets', [
            'user_id' => $this->user->id,
            'sheet_name' => 'Test Mortgage',
            'property_value' => 400000.00,
            'interest_rate' => 6.5,
        ]);
    }

    public function test_can_update_mortgage_sheet(): void
    {
        $sheet = MortgageSheet::factory()->create([
            'user_id' => $this->user->id,
            'sheet_name' => 'Original',
            'property_value' => 300000,
        ]);

        $response = $this->actingAs($this->user)
            ->put(route('mortgage-sheets.update', $sheet), [
                'sheet_name' => 'Updated',
                'property_value' => 350000,
                'interest_rate' => 5.5,
            ]);

        $response->assertStatus(200);

        $sheet->refresh();
        $this->assertEquals('Updated', $sheet->sheet_name);
        $this->assertEquals(350000, $sheet->property_value);
        $this->assertEquals(5.5, $sheet->interest_rate);
    }

    public function test_can_delete_mortgage_sheet(): void
    {
        $sheet = MortgageSheet::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->delete(route('mortgage-sheets.destroy', $sheet));

        $response->assertStatus(200);
        $this->assertDatabaseMissing('mortgage_sheets', ['id' => $sheet->id]);
    }

    public function test_cannot_access_other_users_mortgage_sheet(): void
    {
        $otherUser = User::factory()->create();
        $sheet = MortgageSheet::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($this->user)
            ->get(route('mortgage-sheets.show', $sheet));

        $response->assertForbidden();
    }

    public function test_mortgage_sheet_validation(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('mortgage-sheets.store'), [
                'property_value' => -1000,
                'interest_rate' => 150,
                'loan_term_years' => 100,
            ]);

        $response->assertSessionHasErrors(['property_value', 'interest_rate', 'loan_term_years']);
    }

    public function test_display_title_falls_back_to_address(): void
    {
        $sheet = MortgageSheet::factory()->create([
            'sheet_name' => null,
            'property_address' => '742 Evergreen Terrace',
        ]);

        $this->assertEquals('742 Evergreen Terrace', $sheet->display_title);
    }

    public function test_compute_endpoint_returns_summary(): void
    {
        $response = $this->post('/api/calculators/mortgage/compute', [
            'property_value' => 400000,
            'down_payment' => 80000,
            'interest_rate' => 6.5,
            'loan_term_years' => 30,
            'with_schedule' => false,
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'inputs',
                'computed' => [
                    'principal',
                    'monthly_principal_interest',
                    'monthly_payment_total',
                ],
            ]);
    }
}
