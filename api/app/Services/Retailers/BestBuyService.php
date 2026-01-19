<?php

namespace App\Services\Retailers;

use Illuminate\Support\Facades\Log;

class BestBuyService extends BaseRetailerService
{
    protected function setupHeaders(): void
    {
        $this->headers = [
            'Accept' => 'application/json',
            'User-Agent' => 'TheFrugalist/1.0',
        ];

        if ($this->retailer->api_key) {
            // $this->headers['X-API-Key'] = $this->retailer->api_key;
        }
    }

    public function searchProduct(string $skuUpc): ?array
    {
        // Best Buy API endpoint for product search
        $endpoint = "/v1/products";
        $params = [
            'apiKey' => $this->retailer->api_key,
            'format' => 'json',
            'show' => implode(',', [
                // Core product info
                'sku',
                'upc',
                'name',
                'modelNumber',
                'manufacturer',
                'condition',
                'type',
                // Pricing
                'regularPrice',
                'salePrice',
                'onSale',
                'clearance',
                'dollarSavings',
                'percentSavings',
                'priceUpdateDate',
                // Availability
                'active',
                'orderable',
                'inStoreAvailability',
                'onlineAvailability',
                'inStorePickup',
                'homeDelivery',
                'freeShipping',
                'freeShippingEligible',
                'quantityLimit',
                // Content
                'url',
                'image',
                'longDescription',
                'shortDescription',
                'color',
                // Reviews
                'customerReviewAverage',
                'customerReviewCount',
            ]),
            'pageSize' => 1,
        ];

        // Try SKU first, then UPC
        if (is_numeric($skuUpc) && strlen($skuUpc) >= 10) {
            $params['upc'] = $skuUpc;
            $endpoint .= "(upc={$skuUpc})";
        } else {
            $params['sku'] = $skuUpc;
            $endpoint .= "(sku={$skuUpc})";
        }

        $response = $this->makeRequest($endpoint, $params);

        if (!$response || !$response->json('products')) {
            return null;
        }

        $products = $response->json('products');
        if (empty($products)) {
            return null;
        }

        // Store raw response for debug mode
        if ($this->debugMode) {
            $this->lastRawResponse = [
                'retailer' => 'Best Buy',
                'endpoint' => $this->retailer->api_base_url . $endpoint,
                'response' => $response->json(),
            ];
        }

        return $this->parseProductData($products[0]);
    }

    public function getProductDetails(string $skuUpc): ?array
    {
        return $this->searchProduct($skuUpc);
    }

    protected function parseProductData(array $apiResponse): array
    {
        $retailPrice = $apiResponse['regularPrice'] ?? 0;
        $currentPrice = $apiResponse['salePrice'] ?? 0;

        // Determine stock status using multiple indicators
        $orderable = $apiResponse['orderable'] ?? null;
        $onlineAvailable = $apiResponse['onlineAvailability'] ?? false;
        $inStoreAvailable = $apiResponse['inStoreAvailability'] ?? false;
        $isActive = $apiResponse['active'] ?? true;

        // Product is in stock if it's orderable (not sold out) AND available somewhere
        $inStock = $isActive
            && $orderable !== 'SoldOut'
            && ($onlineAvailable || $inStoreAvailable);

        $data = [
            'name' => $apiResponse['name'] ?? 'Unknown Product',
            'variant' => $apiResponse['modelNumber'] ?? null,
            'description' => $apiResponse['longDescription'] ?? $apiResponse['shortDescription'] ?? null,
            'image_url' => $apiResponse['image'] ?? null,
            'retail_price' => (float) $retailPrice,
            'current_price' => (float) $currentPrice,
            'in_stock' => $inStock,
            'sku_upc' => (string) ($apiResponse['sku'] ?? null),
            'retailer_url' => $apiResponse['url'] ?? null,
            'metadata' => [
                // Product identifiers
                'upc' => $apiResponse['upc'] ?? null,
                'model_number' => $apiResponse['modelNumber'] ?? null,
                'manufacturer' => $apiResponse['manufacturer'] ?? null,
                'condition' => $apiResponse['condition'] ?? null,
                'type' => $apiResponse['type'] ?? null,
                'color' => $apiResponse['color'] ?? null,

                // Pricing details
                'on_sale' => $apiResponse['onSale'] ?? false,
                'clearance' => $apiResponse['clearance'] ?? false,
                'dollar_savings' => $apiResponse['dollarSavings'] ?? null,
                'percent_savings' => $apiResponse['percentSavings'] ?? null,
                'price_update_date' => $apiResponse['priceUpdateDate'] ?? null,

                // Availability details
                'active' => $isActive,
                'orderable' => $orderable,
                'online_availability' => $onlineAvailable,
                'in_store_availability' => $inStoreAvailable,
                'in_store_pickup' => $apiResponse['inStorePickup'] ?? false,
                'home_delivery' => $apiResponse['homeDelivery'] ?? false,
                'free_shipping' => $apiResponse['freeShipping'] ?? false,
                'free_shipping_eligible' => $apiResponse['freeShippingEligible'] ?? false,
                'quantity_limit' => $apiResponse['quantityLimit'] ?? null,

                // Reviews
                'customer_review_average' => $apiResponse['customerReviewAverage'] ?? null,
                'customer_review_count' => $apiResponse['customerReviewCount'] ?? null,

                // URL
                'retailer_url' => $apiResponse['url'] ?? null,
            ],
        ];

        return $this->standardizeProductData($data);
    }
}
