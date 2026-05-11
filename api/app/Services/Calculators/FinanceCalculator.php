<?php

namespace App\Services\Calculators;

class FinanceCalculator
{
    public function __construct(private array $data) {}

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function purchasePrice(): float
    {
        return $this->num('msrp') - $this->num('discounts') - $this->num('rebates');
    }

    public function taxableAmount(): float
    {
        return $this->num('msrp') - $this->num('discounts');
    }

    public function salesTaxAmount(): float
    {
        return $this->taxableAmount() * ($this->num('sales_tax_percent') / 100);
    }

    public function loanAmount(): float
    {
        return $this->purchasePrice() + $this->num('fees') + $this->salesTaxAmount() - $this->num('down_payment');
    }

    public function monthlyPayment(): float
    {
        $pv = $this->loanAmount();
        $n = $this->num('finance_term');
        $rate = $this->num('interest_rate');

        if ($pv <= 0 || $n <= 0) {
            return 0.0;
        }

        if ($rate <= 0) {
            return $pv / $n;
        }

        $r = $rate / 100 / 12;

        return ($pv * $r) / (1 - pow(1 + $r, -$n));
    }

    public function paymentsTotal(): float
    {
        return $this->monthlyPayment() * $this->num('finance_term');
    }

    public function interestAmount(): float
    {
        return $this->paymentsTotal() - $this->loanAmount();
    }

    public function grandTotal(): float
    {
        return $this->paymentsTotal() + $this->num('down_payment');
    }

    /**
     * Generate amortization schedule. Pass true to apply extra payments.
     *
     * @return array{schedule: array<int, array<string, float|int>>, total_interest: float, total_principal: float, months_paid: int, months_saved: int}|null
     */
    public function amortization(bool $withExtraPayments = false): ?array
    {
        $loanAmount = $this->loanAmount();
        $rate = $this->num('interest_rate');
        $term = (int) $this->num('finance_term');
        $monthlyPayment = $this->monthlyPayment();

        if ($loanAmount <= 0 || $rate <= 0 || $term <= 0) {
            return null;
        }

        $schedule = [];
        $remaining = $loanAmount;
        $totalInterest = 0.0;
        $totalPrincipal = 0.0;
        $extras = $this->parseExtraPayments();

        for ($month = 1; $month <= $term && $remaining > 0; $month++) {
            $interestPayment = ($remaining * $rate) / 100 / 12;
            $principalPayment = $monthlyPayment - $interestPayment;

            $extraPayment = 0.0;
            if ($withExtraPayments && ! empty($extras)) {
                $extraPayment = $this->extraForMonth($month, $extras);
            }

            if ($principalPayment + $extraPayment > $remaining) {
                $principalPayment = $remaining;
                $extraPayment = 0.0;
            }

            $totalPayment = $monthlyPayment + $extraPayment;
            $remaining -= $principalPayment + $extraPayment;
            $totalInterest += $interestPayment;
            $totalPrincipal += $principalPayment + $extraPayment;

            $schedule[] = [
                'month' => $month,
                'payment' => $monthlyPayment,
                'extra_payment' => $extraPayment,
                'total_payment' => $totalPayment,
                'principal_payment' => $principalPayment + $extraPayment,
                'interest_payment' => $interestPayment,
                'remaining_balance' => max(0.0, $remaining),
            ];

            if ($remaining <= 0) {
                break;
            }
        }

        return [
            'schedule' => $schedule,
            'total_interest' => $totalInterest,
            'total_principal' => $totalPrincipal,
            'months_paid' => count($schedule),
            'months_saved' => max(0, $term - count($schedule)),
        ];
    }

    public function summary(bool $includeSchedule = true): array
    {
        $amort = $includeSchedule ? $this->amortization(true) : null;

        return [
            'purchase_price' => $this->purchasePrice(),
            'taxable_amount' => $this->taxableAmount(),
            'sales_tax_amount' => $this->salesTaxAmount(),
            'loan_amount' => $this->loanAmount(),
            'monthly_payment' => $this->monthlyPayment(),
            'interest_amount' => $this->interestAmount(),
            'payments_total' => $this->paymentsTotal(),
            'grand_total' => $this->grandTotal(),
            'amortization' => $amort,
        ];
    }

    /** @return array<int, array{startMonth: int, endMonth: int, paymentAmount: float}> */
    private function parseExtraPayments(): array
    {
        $raw = $this->data['extra_payments_json'] ?? null;
        if (empty($raw)) {
            return [];
        }

        $parsed = is_string($raw) ? json_decode($raw, true) : $raw;
        if (! is_array($parsed)) {
            return [];
        }

        return array_map(static fn ($p) => [
            'startMonth' => (int) ($p['startMonth'] ?? 1),
            'endMonth' => (int) ($p['endMonth'] ?? ($p['startMonth'] ?? 1)),
            'paymentAmount' => (float) ($p['paymentAmount'] ?? 0),
        ], $parsed);
    }

    private function extraForMonth(int $month, array $extras): float
    {
        $total = 0.0;
        foreach ($extras as $p) {
            if ($month >= $p['startMonth'] && $month <= $p['endMonth']) {
                $total += $p['paymentAmount'];
            }
        }

        return $total;
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
