<?php

namespace Tests\Unit\Calculators;

use App\Services\Calculators\FinanceCalculator;
use PHPUnit\Framework\TestCase;

class FinanceCalculatorTest extends TestCase
{
    private function baseData(): array
    {
        return [
            'msrp' => 35000,
            'fees' => 500,
            'discounts' => 1000,
            'rebates' => 500,
            'down_payment' => 3000,
            'sales_tax_percent' => 7,
            'interest_rate' => 6,
            'finance_term' => 60,
        ];
    }

    public function test_purchase_price_subtracts_discounts_and_rebates(): void
    {
        $calc = FinanceCalculator::fromArray($this->baseData());

        $this->assertSame(33500.0, $calc->purchasePrice());
    }

    public function test_sales_tax_is_taxable_amount_times_rate(): void
    {
        $calc = FinanceCalculator::fromArray($this->baseData());

        $this->assertEqualsWithDelta(2380.0, $calc->salesTaxAmount(), 0.01);
    }

    public function test_loan_amount_includes_fees_and_tax_minus_down_payment(): void
    {
        $calc = FinanceCalculator::fromArray($this->baseData());

        $this->assertEqualsWithDelta(33380.0, $calc->loanAmount(), 0.01);
    }

    public function test_monthly_payment_standard_amortization(): void
    {
        $calc = FinanceCalculator::fromArray($this->baseData());

        $this->assertEqualsWithDelta(645.31, $calc->monthlyPayment(), 0.5);
    }

    public function test_zero_interest_divides_principal_by_term(): void
    {
        $calc = FinanceCalculator::fromArray(array_merge($this->baseData(), [
            'interest_rate' => 0,
            'fees' => 0,
            'discounts' => 0,
            'rebates' => 0,
            'sales_tax_percent' => 0,
            'down_payment' => 0,
            'msrp' => 12000,
            'finance_term' => 12,
        ]));

        $this->assertSame(1000.0, $calc->monthlyPayment());
    }

    public function test_zero_loan_amount_returns_zero_monthly(): void
    {
        $calc = FinanceCalculator::fromArray([
            'msrp' => 0, 'finance_term' => 60, 'interest_rate' => 6,
        ]);

        $this->assertSame(0.0, $calc->monthlyPayment());
    }

    public function test_amortization_schedule_reaches_zero_balance(): void
    {
        $calc = FinanceCalculator::fromArray($this->baseData());
        $amort = $calc->amortization();

        $this->assertNotNull($amort);
        $this->assertSame(60, count($amort['schedule']));
        $last = end($amort['schedule']);
        $this->assertLessThan(1.0, $last['remaining_balance']);
    }

    public function test_extra_payments_shorten_term(): void
    {
        $calc = FinanceCalculator::fromArray(array_merge($this->baseData(), [
            'extra_payments_json' => json_encode([
                ['startMonth' => 1, 'endMonth' => 60, 'paymentAmount' => 200],
            ]),
        ]));

        $amort = $calc->amortization(true);

        $this->assertNotNull($amort);
        $this->assertLessThan(60, $amort['months_paid']);
        $this->assertGreaterThan(0, $amort['months_saved']);
    }

    public function test_string_inputs_with_currency_chars_are_parsed(): void
    {
        $calc = FinanceCalculator::fromArray([
            'msrp' => '$35,000.00',
            'finance_term' => '60',
            'interest_rate' => '6.0',
        ]);

        $this->assertSame(35000.0, $calc->purchasePrice());
        $this->assertGreaterThan(0, $calc->monthlyPayment());
    }

    public function test_summary_includes_all_keys(): void
    {
        $calc = FinanceCalculator::fromArray($this->baseData());
        $summary = $calc->summary();

        foreach (['purchase_price', 'sales_tax_amount', 'loan_amount', 'monthly_payment',
            'interest_amount', 'payments_total', 'grand_total', 'amortization'] as $key) {
            $this->assertArrayHasKey($key, $summary);
        }
    }
}
