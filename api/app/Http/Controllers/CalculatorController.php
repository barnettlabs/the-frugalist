<?php

namespace App\Http\Controllers;

use App\Services\Calculators\FinanceCalculator;
use App\Services\Calculators\LeaseCalculator;
use App\Services\Calculators\MortgageCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalculatorController extends Controller
{
    public function finance(Request $request): JsonResponse
    {
        $data = $request->validate([
            'msrp' => 'nullable|numeric',
            'fees' => 'nullable|numeric',
            'discounts' => 'nullable|numeric',
            'rebates' => 'nullable|numeric',
            'down_payment' => 'nullable|numeric',
            'sales_tax_percent' => 'nullable|numeric',
            'interest_rate' => 'nullable|numeric',
            'finance_term' => 'nullable|numeric',
            'extra_payments_json' => 'nullable',
            'with_schedule' => 'nullable|boolean',
        ]);

        $includeSchedule = (bool) ($data['with_schedule'] ?? true);
        unset($data['with_schedule']);

        return response()->json([
            'inputs' => $data,
            'computed' => FinanceCalculator::fromArray($data)->summary($includeSchedule),
        ]);
    }

    public function lease(Request $request): JsonResponse
    {
        $data = $request->validate([
            'msrp' => 'nullable|numeric',
            'dealer_contribution' => 'nullable|numeric',
            'trade_in' => 'nullable|numeric',
            'doc_fee' => 'nullable|numeric',
            'acquisition_fee' => 'nullable|numeric',
            'misc_fees' => 'nullable|numeric',
            'lease_cash' => 'nullable|numeric',
            'down_payment' => 'nullable|numeric',
            'money_factor' => 'nullable|numeric',
            'sales_tax_percent' => 'nullable|numeric',
            'residual_percent' => 'nullable|numeric',
            'lease_term' => 'nullable|numeric',
            'with_schedule' => 'nullable|boolean',
        ]);

        $includeSchedule = (bool) ($data['with_schedule'] ?? true);
        unset($data['with_schedule']);

        return response()->json([
            'inputs' => $data,
            'computed' => LeaseCalculator::fromArray($data)->summary($includeSchedule),
        ]);
    }

    public function mortgage(Request $request): JsonResponse
    {
        $data = $request->validate([
            'property_value' => 'nullable|numeric',
            'down_payment' => 'nullable|numeric',
            'interest_rate' => 'nullable|numeric',
            'loan_term_years' => 'nullable|numeric',
            'monthly_hoa' => 'nullable|numeric',
            'annual_insurance' => 'nullable|numeric',
            'annual_property_tax' => 'nullable|numeric',
            'extra_expenses_json' => 'nullable',
            'extra_payments_json' => 'nullable',
            'with_schedule' => 'nullable|boolean',
        ]);

        $includeSchedule = (bool) ($data['with_schedule'] ?? true);
        unset($data['with_schedule']);

        return response()->json([
            'inputs' => $data,
            'computed' => MortgageCalculator::fromArray($data)->summary($includeSchedule),
        ]);
    }
}
