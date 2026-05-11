<?php

namespace App\Http\Controllers;

use App\Models\Retailer;
use App\Models\TrackedProduct;
use App\Services\Retailers\RetailerServiceFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WatchDebugController extends Controller
{
    private function authorizeDebugAccess(): void
    {
        $user = Auth::user();
        $adminEmail = config('app.admin_email');

        if (! $user || ! $adminEmail || $user->email !== $adminEmail) {
            abort(403, 'Debug access not authorized');
        }
    }

    public function canDebug()
    {
        $user = Auth::user();
        $adminEmail = config('app.admin_email');

        return response()->json([
            'can_debug' => $user && $adminEmail && $user->email === $adminEmail,
        ]);
    }

    public function validateProduct(Request $request)
    {
        $this->authorizeDebugAccess();

        $request->validate([
            'sku_upc' => 'required|string',
            'retailer_id' => 'required|exists:retailers,id',
        ]);

        try {
            $retailer = Retailer::findOrFail($request->retailer_id);
            $service = RetailerServiceFactory::create($retailer);
            $service->setDebugMode(true);

            $productData = $service->getProductDetails($request->sku_upc);

            if (! $productData) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Product not found or invalid SKU/UPC',
                    'debug' => [
                        'raw_api_response' => $service->getLastRawResponse(),
                        'parsed_data' => null,
                    ],
                ], 404);
            }

            return response()->json([
                'valid' => true,
                'product' => $productData,
                'debug' => [
                    'raw_api_response' => $service->getLastRawResponse(),
                    'parsed_data' => $productData,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'valid' => false,
                'message' => 'Error validating product: '.$e->getMessage(),
                'debug' => [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ],
            ], 500);
        }
    }

    public function refresh(TrackedProduct $trackedProduct)
    {
        $this->authorizeDebugAccess();

        // Ensure user owns this tracked product
        if ($trackedProduct->user_id !== Auth::id()) {
            abort(403);
        }

        try {
            $service = RetailerServiceFactory::create($trackedProduct->retailer);
            $service->setDebugMode(true);

            $productData = $service->getProductDetails($trackedProduct->sku_upc);

            if (! $productData) {
                return response()->json([
                    'error' => 'Unable to fetch current product data',
                    'debug' => [
                        'raw_api_response' => $service->getLastRawResponse(),
                        'parsed_data' => null,
                        'tracked_product' => $trackedProduct->toArray(),
                    ],
                ], 400);
            }

            $oldPrice = $trackedProduct->current_price;
            $newPrice = $productData['current_price'];

            // Capture what will be saved
            $willSave = [
                'current_price' => $newPrice,
                'product_metadata' => $productData['metadata'],
                'last_checked_at' => now()->toIso8601String(),
            ];

            // Update current price, metadata, and clear any previous errors
            $trackedProduct->update([
                'current_price' => $newPrice,
                'product_metadata' => $productData['metadata'],
                'last_checked_at' => now(),
                'last_scraper_error' => null,
                'last_error_at' => null,
            ]);

            // Add to price history
            $priceHistoryEntry = $trackedProduct->priceHistory()->create([
                'price' => $newPrice,
                'in_stock' => $productData['in_stock'],
                'api_response' => $productData,
                'checked_at' => now(),
            ]);

            // Check for price alerts
            $alertCreated = null;
            if ($newPrice < $oldPrice) {
                $alertType = $newPrice <= $trackedProduct->target_price ? 'target_reached' : 'price_drop';

                $alertCreated = $trackedProduct->priceAlerts()->create([
                    'old_price' => $oldPrice,
                    'new_price' => $newPrice,
                    'alert_type' => $alertType,
                    'triggered_at' => now(),
                ]);
            }

            $trackedProduct->load(['retailer', 'priceHistory', 'priceAlerts']);

            return response()->json([
                'message' => 'Price updated successfully!',
                'tracked_product' => $trackedProduct,
                'debug' => [
                    'raw_api_response' => $service->getLastRawResponse(),
                    'parsed_data' => $productData,
                    'saved_to_db' => $willSave,
                    'price_history_entry' => $priceHistoryEntry->toArray(),
                    'alert_created' => $alertCreated?->toArray(),
                    'price_changed' => $oldPrice !== $newPrice,
                    'old_price' => $oldPrice,
                    'new_price' => $newPrice,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error refreshing price: '.$e->getMessage(),
                'debug' => [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ],
            ], 500);
        }
    }
}
