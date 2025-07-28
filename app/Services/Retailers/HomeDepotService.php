<?php

namespace App\Services\Retailers;

class HomeDepotService extends BaseRetailerService
{
    protected function setupHeaders(): void
    {
        $this->headers = [
            'Accept' => 'application/json',
            'User-Agent' => 'SneakySalesman/1.0',
            'Content-Type' => 'application/json',
        ];

        if ($this->retailer->api_key) {
            $this->headers['Authorization'] = 'Bearer ' . $this->retailer->api_key;
        }
    }

    public function searchProduct(string $skuUpc): ?array
    {
        // Home Depot API typically uses different endpoints for SKU vs UPC
        $endpoint = "/v1/products/search";
        $params = [
            'format' => 'json',
            'limit' => 1,
        ];

        // Determine if it's a SKU (usually 7-10 digits) or UPC (usually 12+ digits)
        if (is_numeric($skuUpc) && strlen($skuUpc) >= 12) {
            $params['upc'] = $skuUpc;
        } else {
            $params['sku'] = $skuUpc;
        }

        $response = $this->makeRequest($endpoint, $params);
        
        if (!$response) {
            return null;
        }

        $data = $response->json();
        if (!isset($data['products']) || empty($data['products'])) {
            return null;
        }

        return $this->parseProductData($data['products'][0]);
    }

    public function getProductDetails(string $skuUpc): ?array
    {
        return $this->searchProduct($skuUpc);
    }

    protected function parseProductData(array $apiResponse): array
    {
        $pricing = $apiResponse['pricing'] ?? [];
        $price = $pricing['value'] ?? $pricing['special'] ?? 0;
        
        $data = [
            'name' => $apiResponse['itemLabel'] ?? $apiResponse['productLabel'] ?? 'Unknown Product',
            'variant' => $apiResponse['modelNumber'] ?? $apiResponse['brandName'] ?? null,
            'description' => $apiResponse['productDescription'] ?? null,
            'image_url' => $apiResponse['media']['images'][0]['url'] ?? null,
            'price' => (float) $price,
            'in_stock' => ($apiResponse['availabilityType']['type'] ?? '') !== 'OUT_OF_STOCK',
            'sku_upc' => $apiResponse['internetNumber'] ?? $apiResponse['upcGtin13'] ?? null,
            'retailer_url' => $apiResponse['seoURL'] ?? null,
            'metadata' => [
                'model_number' => $apiResponse['modelNumber'] ?? null,
                'brand_name' => $apiResponse['brandName'] ?? null,
                'availability_type' => $apiResponse['availabilityType'] ?? null,
                'special_offers' => $apiResponse['specialOffers'] ?? [],
                'store_sku' => $apiResponse['storeSkuNumber'] ?? null,
            ],
        ];

        return $this->standardizeProductData($data);
    }
}