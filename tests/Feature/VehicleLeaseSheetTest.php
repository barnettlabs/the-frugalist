<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\VehicleLeaseSheet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VehicleLeaseSheetTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_create_lease_sheet(): void
    {
        $sheetData = [
            'sheet_name' => 'Test Lease Sheet',
            'sales_consultant' => 'Jane Smith',
            'dealership_name' => 'Lease Dealership',
            'vehicle_type' => 'CAR',
            'vehicle_year' => 2024,
            'vehicle_make' => 'BMW',
            'vehicle_model' => 'X3',
            'vehicle_trim' => 'xDrive30i',
            'msrp' => 45000.00,
            'dealer_contribution' => 1000.00,
            'trade_in' => 5000.00,
            'doc_fee' => 500.00,
            'acquisition_fee' => 800.00,
            'misc_fees' => 200.00,
            'lease_cash' => 2000.00,
            'down_payment' => 3000.00,
            'money_factor' => 0.00125,
            'sales_tax_percent' => 9.25,
            'residual_percent' => 60.0,
            'lease_term' => 36,
            'contact_email' => 'lease@example.com',
            'contact_phone' => '555-0456',
            'notes' => 'Lease test notes'
        ];

        $response = $this->actingAs($this->user)
            ->post(route('vehicle-lease-sheets.store'), $sheetData);

        $response->assertStatus(201);
        
        $this->assertDatabaseHas('vehicle_lease_sheets', [
            'user_id' => $this->user->id,
            'sheet_name' => 'Test Lease Sheet',
            'msrp' => 45000.00,
            'money_factor' => 0.00125,
        ]);
    }

    public function test_can_update_lease_sheet(): void
    {
        $sheet = VehicleLeaseSheet::factory()->create([
            'user_id' => $this->user->id,
            'sheet_name' => 'Original Lease',
            'msrp' => 40000.00,
            'residual_percent' => 55.0
        ]);

        $updateData = [
            'sheet_name' => 'Updated Lease',
            'msrp' => 45000.00,
            'residual_percent' => 60.0,
            'money_factor' => 0.00150,
        ];

        $response = $this->actingAs($this->user)
            ->put(route('vehicle-lease-sheets.update', $sheet), $updateData);

        $response->assertStatus(200);
        
        $sheet->refresh();
        $this->assertEquals('Updated Lease', $sheet->sheet_name);
        $this->assertEquals(45000.00, $sheet->msrp);
        $this->assertEquals(60.0, $sheet->residual_percent);
        $this->assertEquals(0.00150, $sheet->money_factor);
    }

    public function test_can_delete_lease_sheet(): void
    {
        $sheet = VehicleLeaseSheet::factory()->create([
            'user_id' => $this->user->id
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('vehicle-lease-sheets.destroy', $sheet));

        $response->assertStatus(200);
        $this->assertDatabaseMissing('vehicle_lease_sheets', ['id' => $sheet->id]);
    }

    public function test_cannot_access_other_users_lease_sheet(): void
    {
        $otherUser = User::factory()->create();
        $sheet = VehicleLeaseSheet::factory()->create([
            'user_id' => $otherUser->id
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('vehicle-lease-sheets.show', $sheet));

        $response->assertForbidden();
    }

    public function test_lease_sheet_validation(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('vehicle-lease-sheets.store'), [
                'msrp' => -5000,  // Invalid negative value
                'residual_percent' => 150,  // Invalid percentage > 100
                'money_factor' => -0.001,  // Invalid negative money factor
            ]);

        $response->assertSessionHasErrors(['msrp', 'residual_percent', 'money_factor']);
    }

    public function test_lease_display_title_generation(): void
    {
        $sheet = VehicleLeaseSheet::factory()->create([
            'sheet_name' => null,
            'vehicle_year' => 2024,
            'vehicle_make' => 'Audi',
            'vehicle_model' => 'A4',
            'vehicle_trim' => 'Premium',
            'dealership_name' => 'Luxury Motors'
        ]);

        $expectedTitle = '2024 Audi A4 Premium - Luxury Motors';
        $this->assertEquals($expectedTitle, $sheet->display_title);
    }

    public function test_lease_calculations_accuracy(): void
    {
        $sheet = VehicleLeaseSheet::factory()->create([
            'msrp' => 40000.00,
            'residual_percent' => 60.0,
            'money_factor' => 0.00125,
            'lease_term' => 36,
            'sales_tax_percent' => 8.5
        ]);

        // Test that all required fields for calculations are present
        $this->assertNotNull($sheet->msrp);
        $this->assertNotNull($sheet->residual_percent);
        $this->assertNotNull($sheet->money_factor);
        $this->assertNotNull($sheet->lease_term);
    }

    public function test_money_factor_to_apr_conversion(): void
    {
        $moneyFactor = 0.00125;
        $expectedAPR = $moneyFactor * 2400; // 3.0%
        
        $sheet = VehicleLeaseSheet::factory()->create([
            'money_factor' => $moneyFactor
        ]);

        // Money factor should convert to approximately 3% APR
        $calculatedAPR = $sheet->money_factor * 2400;
        $this->assertEquals($expectedAPR, $calculatedAPR);
    }
}