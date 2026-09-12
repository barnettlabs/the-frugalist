<?php

namespace App\Http\Controllers;

use App\Models\VehicleLeaseSheet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleLeaseSheetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sheets = $request->user()->vehicleLeaseSheets()->latest()->get();

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
            'dealer_contribution' => 'nullable|numeric|min:0',
            'trade_in' => 'nullable|numeric|min:0',
            'doc_fee' => 'nullable|numeric|min:0',
            'acquisition_fee' => 'nullable|numeric|min:0',
            'misc_fees' => 'nullable|numeric|min:0',
            'lease_cash' => 'nullable|numeric|min:0',
            'down_payment' => 'nullable|numeric|min:0',
            'money_factor' => 'nullable|numeric|min:0',
            'sales_tax_percent' => 'nullable|numeric|min:0|max:100',
            'residual_percent' => 'nullable|numeric|min:0|max:100',
            'lease_term' => 'nullable|integer|min:1|max:120',
            'start_date' => 'nullable|date',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
        ]);

        $sheet = new VehicleLeaseSheet;
        $sheet->user_id = $request->user()->id;
        /*
         * `except('user_id')` is load-bearing, not defensive dressing.
         *
         * user_id is in $fillable, and fill() runs *after* the line above that
         * sets it from the authenticated user - so a request body containing
         * "user_id": <someone else> overwrote it. That let any authenticated
         * user create records owned by another account, and on update, push
         * their own record into another account. Verified against the running
         * app before this change.
         */
        $sheet->fill($request->except('user_id'));
        $sheet->save();

        return response()->json($sheet, 201);
    }

    public function show(Request $request, VehicleLeaseSheet $vehicleLeaseSheet): JsonResponse
    {
        if ($vehicleLeaseSheet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($vehicleLeaseSheet);
    }

    public function update(Request $request, VehicleLeaseSheet $vehicleLeaseSheet): JsonResponse
    {
        if ($vehicleLeaseSheet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'sheet_name' => 'nullable|string|max:255',
            'sales_consultant' => 'nullable|string|max:255',
            'dealership_name' => 'nullable|string|max:255',
            'vehicle_type' => 'nullable|in:CAR,TRUCK,SUV',
            'shareable_key' => 'nullable|string|max:255',
            'msrp' => 'nullable|numeric|min:0',
            'dealer_contribution' => 'nullable|numeric|min:0',
            'trade_in' => 'nullable|numeric|min:0',
            'doc_fee' => 'nullable|numeric|min:0',
            'acquisition_fee' => 'nullable|numeric|min:0',
            'misc_fees' => 'nullable|numeric|min:0',
            'lease_cash' => 'nullable|numeric|min:0',
            'down_payment' => 'nullable|numeric|min:0',
            'money_factor' => 'nullable|numeric|min:0',
            'sales_tax_percent' => 'nullable|numeric|min:0|max:100',
            'residual_percent' => 'nullable|numeric|min:0|max:100',
            'lease_term' => 'nullable|integer|min:1|max:120',
            'start_date' => 'nullable|date',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
        ]);

        $vehicleLeaseSheet->fill($request->except('user_id'));
        $vehicleLeaseSheet->save();

        return response()->json($vehicleLeaseSheet);
    }

    public function destroy(Request $request, VehicleLeaseSheet $vehicleLeaseSheet): JsonResponse
    {
        if ($vehicleLeaseSheet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $vehicleLeaseSheet->delete();

        return response()->json(['message' => 'Sheet deleted successfully']);
    }
}
