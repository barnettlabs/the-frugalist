<?php

namespace App\Http\Controllers;

use App\Models\Retailer;
use App\Models\TrackedProduct;
use App\Services\Retailers\RetailerServiceFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PriceTrackerController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $trackedProducts = TrackedProduct::with(['retailer', 'priceHistory', 'priceAlerts'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $retailers = Retailer::active()->get();

        return Inertia::render('PriceTracker/Index', [
            'trackedProducts' => $trackedProducts,
            'retailers' => $retailers,
        ]);
    }

    public function create()
    {
        $retailers = Retailer::active()->get();
        $user = Auth::user();

        return Inertia::render('PriceTracker/Create', [
            'retailers' => $retailers,
            'user' => $user,
        ]);
    }

    public function validateProduct(Request $request)
    {
        $request->validate([
            'sku_upc' => 'required|string',
            'retailer_id' => 'required|exists:retailers,id',
        ]);

        try {
            $retailer = Retailer::findOrFail($request->retailer_id);
            $service = RetailerServiceFactory::create($retailer);

            $productData = $service->getProductDetails($request->sku_upc);

            if (!$productData) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Product not found or invalid SKU/UPC'
                ], 404);
            }

            return response()->json([
                'valid' => true,
                'product' => $productData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'valid' => false,
                'message' => 'Error validating product: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'retailer_id' => 'required|exists:retailers,id',
            'sku_upc' => 'required|string',
            'target_price' => 'required|numeric|min:0.01',
            'notification_methods' => 'required|array|min:1',
            'notification_methods.*' => 'in:email,sms',
            'tracking_start_date' => 'required|date|after_or_equal:today',
            'tracking_end_date' => 'nullable|date|after:tracking_start_date',
        ]);

        $user = Auth::user();
        $retailer = Retailer::findOrFail($request->retailer_id);

        // Check if user already tracking this product
        $existing = TrackedProduct::where('user_id', $user->id)
            ->where('retailer_id', $request->retailer_id)
            ->where('sku_upc', $request->sku_upc)
            ->active()
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'sku_upc' => 'You are already tracking this product.'
            ]);
        }

        try {
            // Validate and fetch product details
            $service = RetailerServiceFactory::create($retailer);
            $productData = $service->getProductDetails($request->sku_upc);

            if (!$productData) {
                throw ValidationException::withMessages([
                    'sku_upc' => 'Product not found or invalid SKU/UPC'
                ]);
            }

            // Validate target price is not above current price
            if ($request->target_price >= $productData['current_price']) {
                throw ValidationException::withMessages([
                    'target_price' => 'Target price must be lower than current price ($' . number_format($productData['current_price'], 2) . ')'
                ]);
            }

            // Create tracked product
            $trackedProduct = TrackedProduct::create([
                'user_id' => $user->id,
                'retailer_id' => $request->retailer_id,
                'sku_upc' => $request->sku_upc,
                'product_name' => $productData['name'],
                'product_variant' => $productData['variant'],
                'product_description' => $productData['description'],
                'product_image_url' => $productData['image_url'],
                'retail_price' => $productData['retail_price'],
                'current_price' => $productData['current_price'],
                'target_price' => $request->target_price,
                'notification_method' => $request->notification_methods,
                'tracking_start_date' => $request->tracking_start_date,
                'tracking_end_date' => $request->tracking_end_date,
                'product_metadata' => $productData['metadata'],
                'last_checked_at' => now(),
            ]);

            // Create initial price history entry
            $trackedProduct->priceHistory()->create([
                'price' => $productData['current_price'],
                'in_stock' => $productData['in_stock'],
                'api_response' => $productData,
                'checked_at' => now(),
            ]);

            return redirect()->route('price-tracker.index')
                ->with('success', 'Product tracking started successfully!');

        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'sku_upc' => 'Error setting up product tracking: ' . $e->getMessage()
            ]);
        }
    }

    public function show(TrackedProduct $trackedProduct)
    {
        // Ensure user owns this tracked product
        if ($trackedProduct->user_id !== Auth::id()) {
            abort(403);
        }

        $trackedProduct->load(['retailer', 'priceHistory' => function($query) {
            $query->orderBy('checked_at', 'desc')->limit(50);
        }, 'priceAlerts' => function($query) {
            $query->orderBy('triggered_at', 'desc')->limit(10);
        }]);

        return Inertia::render('PriceTracker/Details', [
            'trackedProduct' => $trackedProduct,
        ]);
    }

    public function update(Request $request, TrackedProduct $trackedProduct)
    {
        // Ensure user owns this tracked product
        if ($trackedProduct->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'target_price' => 'required|numeric|min:0.01',
            'tracking_end_date' => 'nullable|date|after:today',
            'is_active' => 'boolean',
        ]);

        // Custom validation for target price
        if ($request->target_price >= $trackedProduct->current_price) {
            throw ValidationException::withMessages([
                'target_price' => 'Target price must be lower than current price ($' . number_format($trackedProduct->current_price, 2) . ')'
            ]);
        }

        $trackedProduct->update($request->only([
            'target_price',
            'tracking_end_date',
            'is_active'
        ]));

        return back()->with('success', 'Tracking settings updated successfully!');
    }

    public function destroy(TrackedProduct $trackedProduct)
    {
        // Ensure user owns this tracked product
        if ($trackedProduct->user_id !== Auth::id()) {
            abort(403);
        }

        $trackedProduct->delete();

        return redirect()->route('price-tracker.index')
            ->with('success', 'Product tracking stopped successfully!');
    }

    public function refresh(TrackedProduct $trackedProduct)
    {
        // Ensure user owns this tracked product
        if ($trackedProduct->user_id !== Auth::id()) {
            abort(403);
        }

        try {
            $service = RetailerServiceFactory::create($trackedProduct->retailer);
            $productData = $service->getProductDetails($trackedProduct->sku_upc);

            if (!$productData) {
                // Save error to database
                $trackedProduct->update([
                    'last_scraper_error' => 'Unable to fetch current product data',
                    'last_error_at' => now(),
                ]);
                return back()->with('error', 'Unable to fetch current product data');
            }

            $oldPrice = $trackedProduct->current_price;
            $newPrice = $productData['current_price'];

            // Update current price, metadata, and clear any previous errors
            $trackedProduct->update([
                'current_price' => $newPrice,
                'product_metadata' => $productData['metadata'],
                'last_checked_at' => now(),
                'last_scraper_error' => null,
                'last_error_at' => null,
            ]);

            // Add to price history
            $trackedProduct->priceHistory()->create([
                'price' => $newPrice,
                'in_stock' => $productData['in_stock'],
                'api_response' => $productData,
                'checked_at' => now(),
            ]);

            // Check for price alerts
            if ($newPrice < $oldPrice) {
                $alertType = $newPrice <= $trackedProduct->target_price ? 'target_reached' : 'price_drop';

                $trackedProduct->priceAlerts()->create([
                    'old_price' => $oldPrice,
                    'new_price' => $newPrice,
                    'alert_type' => $alertType,
                    'triggered_at' => now(),
                ]);
            }

            return back()->with('success', 'Price updated successfully!');

        } catch (\Exception $e) {
            // Save error to database
            $trackedProduct->update([
                'last_scraper_error' => $e->getMessage(),
                'last_error_at' => now(),
            ]);
            return back()->with('error', 'Error refreshing price: ' . $e->getMessage());
        }
    }

    // API methods for mobile app
    public function apiIndex()
    {
        $user = Auth::user();

        $trackedProducts = TrackedProduct::with(['retailer', 'priceHistory', 'priceAlerts'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $retailers = Retailer::active()->get();

        return response()->json([
            'tracked_products' => $trackedProducts,
            'retailers' => $retailers,
        ]);
    }

    public function apiStore(Request $request)
    {
        $request->validate([
            'retailer_id' => 'required|exists:retailers,id',
            'sku_upc' => 'required|string',
            'target_price' => 'required|numeric|min:0.01',
            'notification_methods' => 'required|array|min:1',
            'notification_methods.*' => 'in:email,sms',
            'tracking_start_date' => 'required|date|after_or_equal:today',
            'tracking_end_date' => 'nullable|date|after:tracking_start_date',
        ]);

        $user = Auth::user();
        $retailer = Retailer::findOrFail($request->retailer_id);

        // Check if user already tracking this product
        $existing = TrackedProduct::where('user_id', $user->id)
            ->where('retailer_id', $request->retailer_id)
            ->where('sku_upc', $request->sku_upc)
            ->active()
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'sku_upc' => 'You are already tracking this product.'
            ]);
        }

        try {
            // Validate and fetch product details
            $service = RetailerServiceFactory::create($retailer);
            $productData = $service->getProductDetails($request->sku_upc);

            if (!$productData) {
                throw ValidationException::withMessages([
                    'sku_upc' => 'Product not found or invalid SKU/UPC'
                ]);
            }

            // Validate target price is not above current price
            if ($request->target_price >= $productData['current_price']) {
                throw ValidationException::withMessages([
                    'target_price' => 'Target price must be lower than current price ($' . number_format($productData['current_price'], 2) . ')'
                ]);
            }

            // Create tracked product
            $trackedProduct = TrackedProduct::create([
                'user_id' => $user->id,
                'retailer_id' => $request->retailer_id,
                'sku_upc' => $request->sku_upc,
                'product_name' => $productData['name'],
                'product_variant' => $productData['variant'],
                'product_description' => $productData['description'],
                'product_image_url' => $productData['image_url'],
                'retail_price' => $productData['retail_price'],
                'current_price' => $productData['current_price'],
                'target_price' => $request->target_price,
                'notification_method' => $request->notification_methods,
                'tracking_start_date' => $request->tracking_start_date,
                'tracking_end_date' => $request->tracking_end_date,
                'product_metadata' => $productData['metadata'],
                'last_checked_at' => now(),
            ]);

            // Create initial price history entry
            $trackedProduct->priceHistory()->create([
                'price' => $productData['current_price'],
                'in_stock' => $productData['in_stock'],
                'api_response' => $productData,
                'checked_at' => now(),
            ]);

            $trackedProduct->load(['retailer', 'priceHistory']);

            return response()->json([
                'message' => 'Product tracking started successfully!',
                'tracked_product' => $trackedProduct,
            ], 201);

        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'sku_upc' => 'Error setting up product tracking: ' . $e->getMessage()
            ]);
        }
    }

    public function apiShow(TrackedProduct $trackedProduct)
    {
        // Ensure user owns this tracked product
        if ($trackedProduct->user_id !== Auth::id()) {
            abort(403);
        }

        $trackedProduct->load(['retailer', 'priceHistory' => function($query) {
            $query->orderBy('checked_at', 'desc')->limit(50);
        }, 'priceAlerts' => function($query) {
            $query->orderBy('triggered_at', 'desc')->limit(10);
        }]);

        return response()->json([
            'tracked_product' => $trackedProduct,
        ]);
    }

    public function apiUpdate(Request $request, TrackedProduct $trackedProduct)
    {
        // Ensure user owns this tracked product
        if ($trackedProduct->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'target_price' => 'nullable|numeric|min:0.01',
            'tracking_end_date' => 'nullable|date|after:today',
            'is_active' => 'boolean',
        ]);

        // Custom validation for target price
        if ($request->target_price >= $trackedProduct->current_price) {
            throw ValidationException::withMessages([
                'target_price' => 'Target price must be lower than current price ($' . number_format($trackedProduct->current_price, 2) . ')'
            ]);
        }

        $trackedProduct->update($request->only([
            'target_price',
            'tracking_end_date',
            'is_active'
        ]));

        $trackedProduct->load(['retailer', 'priceHistory', 'priceAlerts']);

        return response()->json([
            'message' => 'Tracking settings updated successfully!',
            'tracked_product' => $trackedProduct,
        ]);
    }

    public function apiDestroy(TrackedProduct $trackedProduct)
    {
        // Ensure user owns this tracked product
        if ($trackedProduct->user_id !== Auth::id()) {
            abort(403);
        }

        $trackedProduct->delete();

        return response()->json([
            'message' => 'Product tracking stopped successfully!',
        ]);
    }
}
