<?php

namespace App\Http\Controllers;

use App\Models\MortgageSheet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MortgageSheetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sheets = $request->user()->mortgageSheets()->latest()->get();

        return response()->json($sheets);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate($this->validationRules());

        $sheet = new MortgageSheet;
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

    public function show(Request $request, MortgageSheet $mortgageSheet): JsonResponse
    {
        if ($mortgageSheet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($mortgageSheet);
    }

    public function update(Request $request, MortgageSheet $mortgageSheet): JsonResponse
    {
        if ($mortgageSheet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate($this->validationRules());

        $mortgageSheet->fill($request->except('user_id'));
        $mortgageSheet->save();

        return response()->json($mortgageSheet);
    }

    public function destroy(Request $request, MortgageSheet $mortgageSheet): JsonResponse
    {
        if ($mortgageSheet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $mortgageSheet->delete();

        return response()->json(['message' => 'Sheet deleted successfully']);
    }

    private function validationRules(): array
    {
        return [
            'sheet_name' => 'nullable|string|max:255',
            'property_address' => 'nullable|string|max:255',
            'property_type' => 'nullable|in:HOUSE,CONDO,TOWNHOUSE,MULTI_FAMILY,LAND',
            'shareable_key' => 'nullable|string|max:255',
            'property_value' => 'nullable|numeric|min:0',
            'down_payment' => 'nullable|numeric|min:0',
            'interest_rate' => 'nullable|numeric|min:0|max:100',
            'loan_term_years' => 'nullable|integer|min:1|max:50',
            'start_date' => 'nullable|date',
            'monthly_hoa' => 'nullable|numeric|min:0',
            'annual_insurance' => 'nullable|numeric|min:0',
            'annual_property_tax' => 'nullable|numeric|min:0',
            'extra_expenses_json' => 'nullable|string',
            'extra_payments_json' => 'nullable|string',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ];
    }
}
