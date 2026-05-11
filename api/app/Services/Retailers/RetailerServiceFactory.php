<?php

namespace App\Services\Retailers;

use App\Models\Retailer;
use InvalidArgumentException;

class RetailerServiceFactory
{
    private static array $serviceMap = [
        'bestbuy' => BestBuyService::class,
        'homedepot' => HomeDepotService::class,
        // Future retailers can be added here
        // 'amazon' => AmazonService::class,
        // 'target' => TargetService::class,
        // 'lowes' => LowesService::class,
    ];

    public static function create(Retailer $retailer): BaseRetailerService
    {
        $slug = $retailer->slug;

        if (! isset(self::$serviceMap[$slug])) {
            throw new InvalidArgumentException("No service available for retailer: {$retailer->name}");
        }

        $serviceClass = self::$serviceMap[$slug];

        return new $serviceClass($retailer);
    }

    public static function getAvailableRetailers(): array
    {
        return array_keys(self::$serviceMap);
    }

    public static function registerRetailer(string $slug, string $serviceClass): void
    {
        self::$serviceMap[$slug] = $serviceClass;
    }
}
