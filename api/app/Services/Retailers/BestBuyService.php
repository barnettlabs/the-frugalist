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
            'show' => 'sku,name,salePrice,regularPrice,onSale,url,image,longDescription,modelNumber',
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

        $data = [
            'name' => $apiResponse['name'] ?? 'Unknown Product',
            'variant' => $apiResponse['modelNumber'] ?? null,
            'description' => $apiResponse['longDescription'] ?? null,
            'image_url' => $apiResponse['image'] ?? null,
            'retail_price' => (float) $retailPrice,
            'current_price' => (float) $currentPrice,
            'in_stock' => isset($apiResponse['onSale']) ? true : false, // Best Buy doesn't always provide stock info
            'sku_upc' => $apiResponse['sku'] ?? null,
            'retailer_url' => $apiResponse['url'] ?? null,
            'metadata' => [
                // 'retail_price' => $apiResponse['regularPrice'] ?? null,
                // 'current_price' => $apiResponse['salePrice'] ?? null,
                'on_sale' => $apiResponse['onSale'] ?? false,
                'model_number' => $apiResponse['modelNumber'] ?? null,
                'retailer_url' => $apiResponse['url'] ?? null,
            ],
        ];

        return $this->standardizeProductData($data);
    }
}
