<?php

namespace Tests\Unit\Calculators;

use App\Services\Calculators\MortgageCalculator;
use PHPUnit\Framework\TestCase;

class MortgageCalculatorTest extends TestCase
{
    private function baseData(): array
    {
        return [
            'property_value' => 400000,
            'down_payment' => 80000,
            'interest_rate' => 6.5,
            'loan_term_years' => 30,
        ];
    }

    public function test_principal_subtracts_down_payment(): void
    {
        $calc = MortgageCalculator::fromArray($this->baseData());

        $this->assertSame(320000.0, $calc->principal());
    }

    public function test_down_payment_percent(): void
    {
        $calc = MortgageCalculator::fromArray($this->baseData());

        $this->assertEqualsWithDelta(20.0, $calc->downPaymentPercent(), 0.01);
    }

    public function test_loan_term_months(): void
    {
        $calc = MortgageCalculator::fromArray($this->baseData());

        $this->assertSame(360, $calc->loanTermMonths());
    }

    public function test_monthly_principal_and_interest(): void
    {
        $calc = MortgageCalculator::fromArray($this->baseData());

        $this->assertEqualsWithDelta(2022.62, $calc->monthlyPrincipalAndInterest(), 0.5);
    }

    public function test_zero_interest_divides_principal_by_term(): void
    {
        $calc = MortgageCalculator::fromArray([
            'property_value' => 300000,
            'down_payment' => 60000,
            'interest_rate' => 0,
            'loan_term_years' => 20,
        ]);

        $this->assertSame(1000.0, $calc->monthlyPrincipalAndInterest());
    }

    public function test_monthly_escrow_sums_tax_insurance_hoa_and_extras(): void
    {
        $calc = MortgageCalculator::fromArray(array_merge($this->baseData(), [
            'annual_property_tax' => 6000,
            'annual_insurance' => 1200,
            'monthly_hoa' => 150,
            'extra_expenses_json' => json_encode([
                ['label' => 'PMI', 'amount' => 80, 'frequency' => 'monthly'],
                ['label' => 'Flood', 'amount' => 600, 'frequency' => 'annual'],
            ]),
        ]));

        // tax 500 + insurance 100 + hoa 150 + PMI 80 + flood (600/12)=50 => 880
        $this->assertEqualsWithDelta(880.0, $calc->monthlyEscrow(), 0.01);
    }

    public function test_amortization_schedule_reaches_zero_balance(): void
    {
        $calc = MortgageCalculator::fromArray($this->baseData());
        $amort = $calc->amortization();

        $this->assertNotNull($amort);
        $this->assertSame(360, count($amort['schedule']));
        $last = end($amort['schedule']);
        $this->assertLessThan(1.0, $last['remaining_balance']);
    }

    public function test_extra_payments_shorten_term(): void
    {
        $calc = MortgageCalculator::fromArray(array_merge($this->baseData(), [
            'extra_payments_json' => json_encode([
                ['startMonth' => 1, 'endMonth' => 360, 'paymentAmount' => 300],
            ]),
        ]));

        $amort = $calc->amortization(true);

        $this->assertNotNull($amort);
        $this->assertLessThan(360, $amort['months_paid']);
        $this->assertGreaterThan(0, $amort['months_saved']);
        $this->assertGreaterThan(0, $amort['total_extra']);
    }

    public function test_string_inputs_with_currency_chars_are_parsed(): void
    {
        $calc = MortgageCalculator::fromArray([
            'property_value' => '$400,000.00',
            'down_payment' => '$80,000',
            'interest_rate' => '6.5',
            'loan_term_years' => '30',
        ]);

        $this->assertSame(320000.0, $calc->principal());
        $this->assertGreaterThan(0, $calc->monthlyPrincipalAndInterest());
    }

    public function test_summary_includes_all_keys(): void
    {
        $calc = MortgageCalculator::fromArray($this->baseData());
        $summary = $calc->summary();

        foreach ([
            'property_value', 'down_payment', 'down_payment_percent', 'principal',
            'loan_term_months', 'monthly_principal_interest', 'monthly_property_tax',
            'monthly_insurance', 'monthly_hoa', 'monthly_extra_expenses', 'monthly_escrow',
            'monthly_payment_total', 'total_interest', 'total_principal',
            'total_extra_payments', 'total_escrow', 'payments_total', 'grand_total',
            'months_paid', 'months_saved', 'extra_expenses', 'amortization', 'annual_amortization',
        ] as $key) {
            $this->assertArrayHasKey($key, $summary);
        }
    }

    public function test_annual_amortization_rolls_up_months(): void
    {
        $calc = MortgageCalculator::fromArray($this->baseData());
        $annual = $calc->annualAmortization();

        $this->assertNotNull($annual);
        $this->assertSame(30, count($annual));
        $this->assertSame(1, $annual[0]['year']);
        $this->assertSame(1, $annual[0]['start_month']);
        $this->assertSame(12, $annual[0]['end_month']);
    }
}
