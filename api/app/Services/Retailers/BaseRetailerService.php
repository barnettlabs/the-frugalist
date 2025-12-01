<?php

namespace App\Services\Retailers;

use App\Models\Retailer;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

abstract class BaseRetailerService
{
    protected Retailer $retailer;
    protected array $headers = [];

    public function __construct(Retailer $retailer)
    {
        $this->retailer = $retailer;
        $this->setupHeaders();
    }

    abstract protected function setupHeaders(): void;
    abstract public function searchProduct(string $skuUpc): ?array;
    abstract public function getProductDetails(string $skuUpc): ?array;
    abstract protected function parseProductData(array $apiResponse): array;

    protected function makeRequest(string $endpoint, array $params = []): ?Response
    {
        try {
            $response = Http::withHeaders($this->headers)
                ->timeout(30)
                ->get($this->retailer->api_base_url . $endpoint, $params);

            if ($response->successful()) {
                return $response;
            }

            logger()->error("API request failed for {$this->retailer->name}", [
                'endpoint' => $endpoint,
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return null;
        } catch (\Exception $e) {
            logger()->error("API request exception for {$this->retailer->name}", [
                'endpoint' => $endpoint,
                'error' => $e->getMessage()
            ]);

            return null;
        }
    }

    protected function standardizeProductData(array $data): array
    {
        return [
            'name' => $data['name'] ?? 'Unknown Product',
            'variant' => $data['variant'] ?? null,
            'description' => $data['description'] ?? null,
            'image_url' => $data['image_url'] ?? null,
            'retail_price' => (float) ($data['retail_price'] ?? 0),
            'current_price' => (float) ($data['current_price'] ?? 0),
            'in_stock' => (bool) ($data['in_stock'] ?? false),
            'sku_upc' => $data['sku_upc'] ?? null,
            'retailer_url' => $data['retailer_url'] ?? null,
            'metadata' => $data['metadata'] ?? [],
        ];
    }

    public function validateProduct(string $skuUpc): bool
    {
        $product = $this->getProductDetails($skuUpc);
        return $product !== null;
    }
}
