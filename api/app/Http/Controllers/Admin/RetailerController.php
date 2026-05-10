<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Retailer;
use App\Services\Retailers\RetailerServiceFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RetailerController extends Controller
{
    public function index(): JsonResponse
    {
        $retailers = Retailer::orderBy('name')->get()->makeVisible([
            'api_base_url',
            'api_key',
            'api_config',
            'rate_limit_per_hour',
        ]);

        return response()->json(['retailers' => $retailers]);
    }

    public function availableSlugs(): JsonResponse
    {
        $registered = RetailerServiceFactory::getAvailableRetailers();
        $taken = Retailer::pluck('slug')->all();

        return response()->json([
            'registered' => $registered,
            'available' => array_values(array_diff($registered, $taken)),
        ]);
    }

    public function show(Retailer $retailer): JsonResponse
    {
        $retailer->makeVisible([
            'api_base_url',
            'api_key',
            'api_config',
            'rate_limit_per_hour',
        ]);

        return response()->json(['retailer' => $retailer]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:retailers,name',
            'slug' => [
                'required', 'string', 'max:255', 'alpha_dash',
                'unique:retailers,slug',
                Rule::in(RetailerServiceFactory::getAvailableRetailers()),
            ],
            'logo_url' => 'nullable|string|max:1000',
            'api_base_url' => 'required|string|max:1000',
            'api_key' => 'nullable|string|max:1000',
            'api_config' => 'nullable|array',
            'is_active' => 'boolean',
            'coming_soon' => 'boolean',
            'rate_limit_per_hour' => 'integer|min:0',
        ], [
            'slug.in' => 'No service class is registered for that slug. Add it to RetailerServiceFactory first.',
        ]);

        $retailer = Retailer::create($data);
        $retailer->makeVisible(['api_base_url', 'api_key', 'api_config', 'rate_limit_per_hour']);

        return response()->json(['retailer' => $retailer], 201);
    }

    public function update(Request $request, Retailer $retailer): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255|unique:retailers,name,'.$retailer->id,
            'slug' => [
                'sometimes', 'string', 'max:255', 'alpha_dash',
                'unique:retailers,slug,'.$retailer->id,
                Rule::in(RetailerServiceFactory::getAvailableRetailers()),
            ],
            'logo_url' => 'nullable|string|max:1000',
            'api_base_url' => 'sometimes|string|max:1000',
            'api_key' => 'nullable|string|max:1000',
            'api_config' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
            'coming_soon' => 'sometimes|boolean',
            'rate_limit_per_hour' => 'sometimes|integer|min:0',
        ], [
            'slug.in' => 'No service class is registered for that slug. Add it to RetailerServiceFactory first.',
        ]);

        $retailer->update($data);
        $retailer->makeVisible(['api_base_url', 'api_key', 'api_config', 'rate_limit_per_hour']);

        return response()->json(['retailer' => $retailer]);
    }

    public function destroy(Retailer $retailer): JsonResponse
    {
        $retailer->delete();

        return response()->json(['message' => 'Retailer deleted.']);
    }
}
