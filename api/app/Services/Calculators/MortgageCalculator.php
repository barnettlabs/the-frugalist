<?php

namespace App\Services\Calculators;

class MortgageCalculator
{
    public function __construct(private array $data) {}

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function propertyValue(): float
    {
        return $this->num('property_value');
    }

    public function downPayment(): float
    {
        return $this->num('down_payment');
    }

    public function downPaymentPercent(): float
    {
        $pv = $this->propertyValue();

        return $pv <= 0 ? 0.0 : ($this->downPayment() / $pv) * 100;
    }

    public function principal(): float
    {
        return max(0.0, $this->propertyValue() - $this->downPayment());
    }

    public function loanTermMonths(): int
    {
        return (int) ($this->num('loan_term_years') * 12);
    }

    public function monthlyPrincipalAndInterest(): float
    {
        $pv = $this->principal();
        $n = $this->loanTermMonths();
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

    public function monthlyPropertyTax(): float
    {
        return $this->num('annual_property_tax') / 12;
    }

    public function monthlyInsurance(): float
    {
        return $this->num('annual_insurance') / 12;
    }

    public function monthlyHoa(): float
    {
        return $this->num('monthly_hoa');
    }

    /** @return array{monthly: float, annual: float, items: array<int, array{label: string, amount: float, frequency: string, monthly: float}>} */
    public function extraExpensesBreakdown(): array
    {
        $items = $this->parseExtraExpenses();
        $monthly = 0.0;

        $detailed = [];
        foreach ($items as $item) {
            $perMonth = $item['frequency'] === 'annual' ? ($item['amount'] / 12) : $item['amount'];
            $monthly += $perMonth;

            $detailed[] = [
                'label' => $item['label'],
                'amount' => $item['amount'],
                'frequency' => $item['frequency'],
                'monthly' => $perMonth,
            ];
        }

        return [
            'monthly' => $monthly,
            'annual' => $monthly * 12,
            'items' => $detailed,
        ];
    }

    public function monthlyExtraExpenses(): float
    {
        return $this->extraExpensesBreakdown()['monthly'];
    }

    public function monthlyEscrow(): float
    {
        return $this->monthlyPropertyTax()
            + $this->monthlyInsurance()
            + $this->monthlyHoa()
            + $this->monthlyExtraExpenses();
    }

    public function monthlyPaymentTotal(): float
    {
        return $this->monthlyPrincipalAndInterest() + $this->monthlyEscrow();
    }

    /**
     * Build amortization schedule (per month). Pass true to apply extra principal payments.
     *
     * @return array{schedule: array<int, array<string, float|int>>, total_interest: float, total_principal: float, total_extra: float, total_escrow: float, months_paid: int, months_saved: int}|null
     */
    public function amortization(bool $withExtraPayments = false): ?array
    {
        $principal = $this->principal();
        $rate = $this->num('interest_rate');
        $term = $this->loanTermMonths();
        $monthlyPi = $this->monthlyPrincipalAndInterest();
        $escrow = $this->monthlyEscrow();

        if ($principal <= 0 || $term <= 0) {
            return null;
        }

        $schedule = [];
        $remaining = $principal;
        $totalInterest = 0.0;
        $totalPrincipalPaid = 0.0;
        $totalExtra = 0.0;
        $totalEscrow = 0.0;
        $extras = $this->parseExtraPayments();

        for ($month = 1; $month <= $term && $remaining > 0; $month++) {
            $interestPayment = $rate > 0 ? ($remaining * $rate) / 100 / 12 : 0.0;
            $principalPayment = $monthlyPi - $interestPayment;

            $extraPayment = 0.0;
            if ($withExtraPayments && ! empty($extras)) {
                $extraPayment = $this->extraForMonth($month, $extras);
            }

            if ($principalPayment + $extraPayment > $remaining) {
                $overage = ($principalPayment + $extraPayment) - $remaining;
                if ($extraPayment >= $overage) {
                    $extraPayment -= $overage;
                } else {
                    $principalPayment = max(0.0, $remaining - $extraPayment);
                    if ($principalPayment + $extraPayment > $remaining) {
                        $extraPayment = max(0.0, $remaining - $principalPayment);
                    }
                }
            }

            $totalPayment = $monthlyPi + $extraPayment + $escrow;
            $remaining -= $principalPayment + $extraPayment;
            $totalInterest += $interestPayment;
            $totalPrincipalPaid += $principalPayment + $extraPayment;
            $totalExtra += $extraPayment;
            $totalEscrow += $escrow;

            $schedule[] = [
                'month' => $month,
                'payment' => $monthlyPi,
                'extra_payment' => $extraPayment,
                'escrow_payment' => $escrow,
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
            'total_principal' => $totalPrincipalPaid,
            'total_extra' => $totalExtra,
            'total_escrow' => $totalEscrow,
            'months_paid' => count($schedule),
            'months_saved' => max(0, $term - count($schedule)),
        ];
    }

    /**
     * Roll the monthly schedule up into annual rows (year 1, 2, ...). Useful for compact tables.
     *
     * @return array<int, array<string, float|int>>|null
     */
    public function annualAmortization(bool $withExtraPayments = false): ?array
    {
        $amort = $this->amortization($withExtraPayments);
        if (! $amort) {
            return null;
        }

        $years = [];
        foreach ($amort['schedule'] as $row) {
            $year = (int) ceil($row['month'] / 12);
            $years[$year] ??= [
                'year' => $year,
                'start_month' => $row['month'],
                'end_month' => $row['month'],
                'payment' => 0.0,
                'extra_payment' => 0.0,
                'escrow_payment' => 0.0,
                'total_payment' => 0.0,
                'principal_payment' => 0.0,
                'interest_payment' => 0.0,
                'remaining_balance' => $row['remaining_balance'],
            ];

            $years[$year]['end_month'] = $row['month'];
            $years[$year]['payment'] += $row['payment'];
            $years[$year]['extra_payment'] += $row['extra_payment'];
            $years[$year]['escrow_payment'] += $row['escrow_payment'];
            $years[$year]['total_payment'] += $row['total_payment'];
            $years[$year]['principal_payment'] += $row['principal_payment'];
            $years[$year]['interest_payment'] += $row['interest_payment'];
            $years[$year]['remaining_balance'] = $row['remaining_balance'];
        }

        return array_values($years);
    }

    public function summary(bool $includeSchedule = true): array
    {
        $amort = $includeSchedule ? $this->amortization(true) : null;
        $annual = $includeSchedule ? $this->annualAmortization(true) : null;

        $monthlyPi = $this->monthlyPrincipalAndInterest();
        $escrow = $this->monthlyEscrow();

        return [
            // Inputs / derived
            'property_value' => $this->propertyValue(),
            'down_payment' => $this->downPayment(),
            'down_payment_percent' => $this->downPaymentPercent(),
            'principal' => $this->principal(),
            'loan_term_months' => $this->loanTermMonths(),

            // Monthly numbers
            'monthly_principal_interest' => $monthlyPi,
            'monthly_property_tax' => $this->monthlyPropertyTax(),
            'monthly_insurance' => $this->monthlyInsurance(),
            'monthly_hoa' => $this->monthlyHoa(),
            'monthly_extra_expenses' => $this->monthlyExtraExpenses(),
            'monthly_escrow' => $escrow,
            'monthly_payment_total' => $monthlyPi + $escrow,

            // Loan totals (scheduled - if includeSchedule false, derived from straight term)
            'total_interest' => $amort['total_interest'] ?? max(0.0, ($monthlyPi * $this->loanTermMonths()) - $this->principal()),
            'total_principal' => $amort['total_principal'] ?? $this->principal(),
            'total_extra_payments' => $amort['total_extra'] ?? 0.0,
            'total_escrow' => $amort['total_escrow'] ?? $escrow * $this->loanTermMonths(),
            'payments_total' => ($amort['total_interest'] ?? 0) + ($amort['total_principal'] ?? $this->principal()),
            'grand_total' => $this->downPayment()
                + ($amort['total_interest'] ?? 0)
                + ($amort['total_principal'] ?? $this->principal())
                + ($amort['total_escrow'] ?? $escrow * $this->loanTermMonths()),

            // Term changes from extra payments
            'months_paid' => $amort['months_paid'] ?? $this->loanTermMonths(),
            'months_saved' => $amort['months_saved'] ?? 0,

            // Expense detail
            'extra_expenses' => $this->extraExpensesBreakdown(),

            // Schedules
            'amortization' => $amort,
            'annual_amortization' => $annual,
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

        $term = $this->loanTermMonths();

        return array_map(static function ($p) use ($term) {
            $start = (int) ($p['startMonth'] ?? 1);
            $endRaw = $p['endMonth'] ?? null;
            $end = $endRaw === null || $endRaw === '' ? ($term > 0 ? $term : $start) : (int) $endRaw;

            return [
                'startMonth' => max(1, $start),
                'endMonth' => $end,
                'paymentAmount' => (float) ($p['paymentAmount'] ?? 0),
            ];
        }, $parsed);
    }

    /** @return array<int, array{label: string, amount: float, frequency: string}> */
    private function parseExtraExpenses(): array
    {
        $raw = $this->data['extra_expenses_json'] ?? null;
        if (empty($raw)) {
            return [];
        }

        $parsed = is_string($raw) ? json_decode($raw, true) : $raw;
        if (! is_array($parsed)) {
            return [];
        }

        return array_map(static function ($e) {
            $freq = strtolower((string) ($e['frequency'] ?? 'monthly'));
            if (! in_array($freq, ['monthly', 'annual'], true)) {
                $freq = 'monthly';
            }

            return [
                'label' => (string) ($e['label'] ?? 'Expense'),
                'amount' => (float) ($e['amount'] ?? 0),
                'frequency' => $freq,
            ];
        }, $parsed);
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
