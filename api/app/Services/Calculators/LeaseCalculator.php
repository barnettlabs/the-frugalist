<?php

namespace App\Services\Calculators;

class LeaseCalculator
{
    public function __construct(private array $data) {}

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function residualAmount(): float
    {
        return $this->num('msrp') * ($this->num('residual_percent') / 100);
    }

    public function interestRate(): float
    {
        return $this->num('money_factor') * 2400;
    }

    public function finalDealerPrice(): float
    {
        return $this->num('msrp') - $this->num('dealer_contribution') - $this->num('trade_in');
    }

    public function grossCapCost(): float
    {
        return $this->finalDealerPrice()
            + $this->num('doc_fee')
            + $this->num('acquisition_fee')
            + $this->num('misc_fees');
    }

    public function netCapCost(): float
    {
        return $this->grossCapCost() - $this->num('lease_cash') - $this->num('down_payment');
    }

    public function principalAmount(): float
    {
        return $this->netCapCost() - $this->residualAmount();
    }

    public function residualMonthlyInterestPayment(): float
    {
        return ($this->residualAmount() * $this->interestRate()) / 100 / 12;
    }

    public function monthlyPrincipalPayment(): float
    {
        $pv = $this->principalAmount();
        $n = $this->num('lease_term');
        $apr = $this->interestRate();

        if ($apr <= 0 || $n <= 0) {
            return 0.0;
        }

        $r = $apr / 1200;
        $paymentPI = ($pv * $r) / (1 - pow(1 + $r, -$n));

        return $paymentPI + $this->residualMonthlyInterestPayment();
    }

    public function totalSalesTax(): float
    {
        $multiplier = $this->num('sales_tax_percent') / 100;
        $term = $this->num('lease_term');
        $monthlyBeforeTax = $this->monthlyPrincipalPayment() + $this->residualMonthlyInterestPayment();

        $taxOnRebates = $this->num('lease_cash') * $multiplier;
        $taxOnDown = $this->num('down_payment') * $multiplier;
        $taxOnMonthly = $monthlyBeforeTax * $multiplier * $term;

        return $taxOnRebates + $taxOnDown + $taxOnMonthly;
    }

    public function monthlySalesTax(): float
    {
        $term = $this->num('lease_term');

        return $term <= 0 ? 0.0 : $this->totalSalesTax() / $term;
    }

    public function leasePayment(): float
    {
        return $this->monthlyPrincipalPayment()
            + $this->residualMonthlyInterestPayment()
            + $this->monthlySalesTax();
    }

    public function cashDueAtSigning(): float
    {
        return $this->num('down_payment') + $this->leasePayment();
    }

    public function totalLeaseCost(): float
    {
        return $this->leasePayment() * $this->num('lease_term') + $this->cashDueAtSigning();
    }

    /** @return array<int, array<string, float|int>> */
    public function schedule(): array
    {
        $term = (int) $this->num('lease_term');
        $monthlyPrincipal = $this->monthlyPrincipalPayment();
        $residualInterest = $this->residualMonthlyInterestPayment();
        $monthlyTax = $this->monthlySalesTax();
        $payment = $this->leasePayment();

        $remaining = $this->principalAmount();
        $schedule = [];

        for ($month = 1; $month <= $term; $month++) {
            $remaining -= $monthlyPrincipal;

            $schedule[] = [
                'month' => $month,
                'principal_payment' => $monthlyPrincipal,
                'interest_payment' => $residualInterest,
                'tax_payment' => $monthlyTax,
                'total_payment' => $payment,
                'remaining_principal' => max(0.0, $remaining),
            ];
        }

        return $schedule;
    }

    public function summary(bool $includeSchedule = true): array
    {
        return [
            'residual_amount' => $this->residualAmount(),
            'interest_rate' => $this->interestRate(),
            'final_dealer_price' => $this->finalDealerPrice(),
            'gross_cap_cost' => $this->grossCapCost(),
            'net_cap_cost' => $this->netCapCost(),
            'principal_amount' => $this->principalAmount(),
            'monthly_principal_payment' => $this->monthlyPrincipalPayment(),
            'residual_monthly_interest_payment' => $this->residualMonthlyInterestPayment(),
            'total_sales_tax' => $this->totalSalesTax(),
            'monthly_sales_tax' => $this->monthlySalesTax(),
            'lease_payment' => $this->leasePayment(),
            'cash_due_at_signing' => $this->cashDueAtSigning(),
            'total_lease_cost' => $this->totalLeaseCost(),
            'schedule' => $includeSchedule ? $this->schedule() : null,
        ];
    }

    private function num(string $key): float
    {
        $v = $this->data[$key] ?? 0;
        if (is_string($v)) {
            $v = preg_replace('/[^0-9.\-]/', '', $v);

            return $v === '' ? 0.0 : (float) $v;
        }

        return is_numeric($v) ? (float) $v : 0.0;
    }
}
