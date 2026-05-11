<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\VehicleFinanceSheet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VehicleFinanceSheetTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_create_finance_sheet(): void
    {
        $sheetData = [
            'sheet_name' => 'Test Finance Sheet',
            'sales_consultant' => 'John Doe',
            'dealership_name' => 'Test Dealership',
            'vehicle_type' => 'CAR',
            'vehicle_year' => 2024,
            'vehicle_make' => 'Toyota',
            'vehicle_model' => 'Camry',
            'vehicle_trim' => 'LE',
            'msrp' => 25000.00,
            'fees' => 1500.00,
            'discounts' => 2000.00,
            'rebates' => 500.00,
            'down_payment' => 5000.00,
            'sales_tax_percent' => 8.5,
            'interest_rate' => 4.5,
            'finance_term' => 60,
            'contact_email' => 'test@example.com',
            'contact_phone' => '555-0123',
            'notes' => 'Test notes',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('vehicle-finance-sheets.store'), $sheetData);

        $response->assertStatus(201);

        $this->assertDatabaseHas('vehicle_finance_sheets', [
            'user_id' => $this->user->id,
            'sheet_name' => 'Test Finance Sheet',
            'msrp' => 25000.00,
            'interest_rate' => 4.5,
        ]);
    }

    public function test_can_update_finance_sheet(): void
    {
        $sheet = VehicleFinanceSheet::factory()->create([
            'user_id' => $this->user->id,
            'sheet_name' => 'Original Name',
            'msrp' => 20000.00,
        ]);

        $updateData = [
            'sheet_name' => 'Updated Name',
            'msrp' => 25000.00,
            'interest_rate' => 3.5,
        ];

        $response = $this->actingAs($this->user)
            ->put(route('vehicle-finance-sheets.update', $sheet), $updateData);

        $response->assertStatus(200);

        $sheet->refresh();
        $this->assertEquals('Updated Name', $sheet->sheet_name);
        $this->assertEquals(25000.00, $sheet->msrp);
        $this->assertEquals(3.5, $sheet->interest_rate);
    }

    public function test_can_delete_finance_sheet(): void
    {
        $sheet = VehicleFinanceSheet::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('vehicle-finance-sheets.destroy', $sheet));

        $response->assertStatus(200);
        $this->assertDatabaseMissing('vehicle_finance_sheets', ['id' => $sheet->id]);
    }

    public function test_cannot_access_other_users_finance_sheet(): void
    {
        $otherUser = User::factory()->create();
        $sheet = VehicleFinanceSheet::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('vehicle-finance-sheets.show', $sheet));

        $response->assertForbidden();
    }

    public function test_finance_sheet_validation(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('vehicle-finance-sheets.store'), [
                'msrp' => -1000,  // Invalid negative value
                'interest_rate' => 150,  // Invalid high interest rate
            ]);

        $response->assertSessionHasErrors(['msrp', 'interest_rate']);
    }

    public function test_display_title_generation(): void
    {
        $sheet = VehicleFinanceSheet::factory()->create([
            'sheet_name' => null,
            'vehicle_year' => 2024,
            'vehicle_make' => 'Honda',
            'vehicle_model' => 'Accord',
            'vehicle_trim' => 'EX',
            'dealership_name' => 'Test Motors',
        ]);

        $expectedTitle = '2024 Honda Accord EX - Test Motors';
        $this->assertEquals($expectedTitle, $sheet->display_title);
    }

    public function test_extra_payments_json_field(): void
    {
        $extraPayments = [
            ['month' => 12, 'amount' => 1000],
            ['month' => 24, 'amount' => 1500],
        ];

        $sheet = VehicleFinanceSheet::factory()->create([
            'user_id' => $this->user->id,
            'extra_payments_json' => json_encode($extraPayments),
        ]);

        $decodedPayments = json_decode($sheet->extra_payments_json, true);
        $this->assertEquals($extraPayments, $decodedPayments);
    }
}
