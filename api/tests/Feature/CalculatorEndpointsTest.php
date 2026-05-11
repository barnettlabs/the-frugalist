<?php

namespace Tests\Feature;

use Tests\TestCase;

class CalculatorEndpointsTest extends TestCase
{
    public function test_finance_compute_returns_summary(): void
    {
        $response = $this->postJson('/api/calculators/finance/compute', [
            'msrp' => 35000,
            'fees' => 500,
            'discounts' => 1000,
            'rebates' => 500,
            'down_payment' => 3000,
            'sales_tax_percent' => 7,
            'interest_rate' => 6,
            'finance_term' => 60,
            'with_schedule' => false,
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'inputs',
                'computed' => [
                    'purchase_price', 'loan_amount', 'monthly_payment',
                    'interest_amount', 'payments_total', 'grand_total',
                ],
            ]);

        $this->assertEquals(33500, $response->json('computed.purchase_price'));
    }

    public function test_lease_compute_returns_summary(): void
    {
        $response = $this->postJson('/api/calculators/lease/compute', [
            'msrp' => 45000,
            'dealer_contribution' => 2000,
            'doc_fee' => 500,
            'acquisition_fee' => 695,
            'lease_cash' => 1000,
            'down_payment' => 2000,
            'money_factor' => 0.0021,
            'sales_tax_percent' => 7,
            'residual_percent' => 60,
            'lease_term' => 36,
            'with_schedule' => false,
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'inputs',
                'computed' => [
                    'residual_amount', 'interest_rate', 'net_cap_cost',
                    'monthly_principal_payment', 'lease_payment', 'total_lease_cost',
                ],
            ]);

        $this->assertEquals(27000, $response->json('computed.residual_amount'));
    }

    public function test_finance_rejects_non_numeric_msrp(): void
    {
        $this->postJson('/api/calculators/finance/compute', ['msrp' => 'banana'])
            ->assertStatus(422);
    }
}
