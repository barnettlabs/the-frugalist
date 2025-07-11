<?php

namespace App\Http\Controllers;

use App\Models\VehicleFinanceSheet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleFinanceSheetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sheets = $request->user()->vehicleFinanceSheets()->latest()->get();

        return response()->json($sheets);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'sheet_name' => 'nullable|string|max:255',
            'sales_consultant' => 'nullable|string|max:255',
            'dealership_name' => 'nullable|string|max:255',
            'vehicle_type' => 'nullable|in:CAR,TRUCK,SUV',
            'shareable_key' => 'nullable|string|max:255',
            'msrp' => 'nullable|numeric|min:0',
            'fees' => 'nullable|numeric|min:0',
            'discounts' => 'nullable|numeric|min:0',
            'rebates' => 'nullable|numeric|min:0',
            'down_payment' => 'nullable|numeric|min:0',
            'sales_tax_percent' => 'nullable|numeric|min:0|max:100',
            'interest_rate' => 'nullable|numeric|min:0|max:100',
            'finance_term' => 'nullable|integer|min:1|max:120',
            'start_date' => 'nullable|date',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'extra_payments_json' => 'nullable|string',
        ]);

        $sheet = new VehicleFinanceSheet;
        $sheet->user_id = $request->user()->id;
        $sheet->fill($request->all());
        $sheet->save();

        return response()->json($sheet, 201);
    }

    public function show(Request $request, VehicleFinanceSheet $vehicleFinanceSheet): JsonResponse
    {
        if ($vehicleFinanceSheet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($vehicleFinanceSheet);
    }

    public function update(Request $request, VehicleFinanceSheet $vehicleFinanceSheet): JsonResponse
    {
        if ($vehicleFinanceSheet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'sheet_name' => 'nullable|string|max:255',
            'sales_consultant' => 'nullable|string|max:255',
            'dealership_name' => 'nullable|string|max:255',
            'vehicle_type' => 'nullable|in:CAR,TRUCK,SUV',
            'shareable_key' => 'nullable|string|max:255',
            'msrp' => 'nullable|numeric|min:0',
            'fees' => 'nullable|numeric|min:0',
            'discounts' => 'nullable|numeric|min:0',
            'rebates' => 'nullable|numeric|min:0',
            'down_payment' => 'nullable|numeric|min:0',
            'sales_tax_percent' => 'nullable|numeric|min:0|max:100',
            'interest_rate' => 'nullable|numeric|min:0|max:100',
            'finance_term' => 'nullable|integer|min:1|max:120',
            'start_date' => 'nullable|date',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'extra_payments_json' => 'nullable|string',
        ]);

        $vehicleFinanceSheet->fill($request->all());
        $vehicleFinanceSheet->save();

        return response()->json($vehicleFinanceSheet);
    }

    public function destroy(Request $request, VehicleFinanceSheet $vehicleFinanceSheet): JsonResponse
    {
        if ($vehicleFinanceSheet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $vehicleFinanceSheet->delete();

        return response()->json(['message' => 'Sheet deleted successfully']);
    }
}
