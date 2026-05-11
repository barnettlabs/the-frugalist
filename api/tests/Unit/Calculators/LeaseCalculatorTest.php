<?php

namespace Tests\Unit\Calculators;

use App\Services\Calculators\LeaseCalculator;
use PHPUnit\Framework\TestCase;

class LeaseCalculatorTest extends TestCase
{
    private function baseData(): array
    {
        return [
            'msrp' => 45000,
            'dealer_contribution' => 2000,
            'trade_in' => 0,
            'doc_fee' => 500,
            'acquisition_fee' => 695,
            'misc_fees' => 0,
            'lease_cash' => 1000,
            'down_payment' => 2000,
            'money_factor' => 0.0021,
            'sales_tax_percent' => 7,
            'residual_percent' => 60,
            'lease_term' => 36,
        ];
    }

    public function test_residual_amount_is_msrp_times_percent(): void
    {
        $calc = LeaseCalculator::fromArray($this->baseData());

        $this->assertSame(27000.0, $calc->residualAmount());
    }

    public function test_interest_rate_from_money_factor(): void
    {
        $calc = LeaseCalculator::fromArray($this->baseData());

        $this->assertEqualsWithDelta(5.04, $calc->interestRate(), 0.01);
    }

    public function test_final_dealer_price_subtracts_contribution_and_trade(): void
    {
        $calc = LeaseCalculator::fromArray($this->baseData());

        $this->assertSame(43000.0, $calc->finalDealerPrice());
    }

    public function test_gross_cap_cost_adds_fees(): void
    {
        $calc = LeaseCalculator::fromArray($this->baseData());

        $this->assertSame(44195.0, $calc->grossCapCost());
    }

    public function test_net_cap_cost_subtracts_lease_cash_and_down(): void
    {
        $calc = LeaseCalculator::fromArray($this->baseData());

        $this->assertSame(41195.0, $calc->netCapCost());
    }

    public function test_principal_amount(): void
    {
        $calc = LeaseCalculator::fromArray($this->baseData());

        $this->assertSame(14195.0, $calc->principalAmount());
    }

    public function test_zero_term_or_zero_apr_returns_zero_monthly_principal(): void
    {
        $calc = LeaseCalculator::fromArray(array_merge($this->baseData(), [
            'money_factor' => 0,
        ]));
        $this->assertSame(0.0, $calc->monthlyPrincipalPayment());

        $calc2 = LeaseCalculator::fromArray(array_merge($this->baseData(), [
            'lease_term' => 0,
        ]));
        $this->assertSame(0.0, $calc2->monthlyPrincipalPayment());
    }

    public function test_lease_payment_is_principal_plus_interest_plus_tax(): void
    {
        $calc = LeaseCalculator::fromArray($this->baseData());
        $expected = $calc->monthlyPrincipalPayment()
            + $calc->residualMonthlyInterestPayment()
            + $calc->monthlySalesTax();

        $this->assertEqualsWithDelta($expected, $calc->leasePayment(), 0.001);
    }

    public function test_schedule_has_one_entry_per_month(): void
    {
        $calc = LeaseCalculator::fromArray($this->baseData());
        $schedule = $calc->schedule();

        $this->assertCount(36, $schedule);
        $this->assertSame(1, $schedule[0]['month']);
        $this->assertSame(36, $schedule[35]['month']);
    }

    public function test_summary_includes_all_keys(): void
    {
        $calc = LeaseCalculator::fromArray($this->baseData());
        $summary = $calc->summary();

        foreach (['residual_amount', 'interest_rate', 'final_dealer_price', 'gross_cap_cost',
            'net_cap_cost', 'principal_amount', 'monthly_principal_payment',
            'residual_monthly_interest_payment', 'total_sales_tax', 'monthly_sales_tax',
            'lease_payment', 'cash_due_at_signing', 'total_lease_cost', 'schedule'] as $key) {
            $this->assertArrayHasKey($key, $summary);
        }
    }
}
