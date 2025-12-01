<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RetailerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $retailers = [
            [
                'name' => 'Best Buy',
                'slug' => 'bestbuy',
                'api_base_url' => 'https://api.bestbuy.com',
                'api_key' => env('BESTBUY_API_KEY'),
                'api_config' => [
                    'rate_limit' => 5, // requests per second
                    'supports_upc' => true,
                    'supports_sku' => true,
                ],
                'is_active' => true,
                'rate_limit_per_hour' => 1000,
            ],
            [
                'name' => 'Home Depot',
                'slug' => 'homedepot',
                'api_base_url' => 'https://api.homedepot.com',
                'api_key' => env('HOMEDEPOT_API_KEY'),
                'api_config' => [
                    'rate_limit' => 10, // requests per second
                    'supports_upc' => true,
                    'supports_sku' => true,
                ],
                'is_active' => true,
                'rate_limit_per_hour' => 2000,
            ],
            // Future retailers (initially inactive)
            [
                'name' => 'Amazon',
                'slug' => 'amazon',
                'api_base_url' => 'https://webservices.amazon.com',
                'api_key' => env('AMAZON_API_KEY'),
                'api_config' => [
                    'rate_limit' => 1, // requests per second (Amazon has strict limits)
                    'supports_upc' => true,
                    'supports_asin' => true,
                ],
                'is_active' => false, // Will be activated when service is implemented
                'rate_limit_per_hour' => 500,
            ],
            [
                'name' => 'Target',
                'slug' => 'target',
                'api_base_url' => 'https://api.target.com',
                'api_key' => env('TARGET_API_KEY'),
                'api_config' => [
                    'rate_limit' => 5,
                    'supports_upc' => true,
                    'supports_sku' => true,
                ],
                'is_active' => false,
                'rate_limit_per_hour' => 1500,
            ],
            [
                'name' => 'Lowes',
                'slug' => 'lowes',
                'api_base_url' => 'https://api.lowes.com',
                'api_key' => env('LOWES_API_KEY'),
                'api_config' => [
                    'rate_limit' => 10,
                    'supports_upc' => true,
                    'supports_sku' => true,
                ],
                'is_active' => false,
                'rate_limit_per_hour' => 2000,
            ],
        ];

        foreach ($retailers as $retailer) {
            \App\Models\Retailer::updateOrCreate(
                ['slug' => $retailer['slug']],
                $retailer
            );
        }
    }
}
