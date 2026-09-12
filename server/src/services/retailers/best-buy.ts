import { BaseRetailerClient } from './base.js';
import type { RetailerProduct } from './types.js';

/** Port of App\Services\Retailers\BestBuyService. */

const SHOW_FIELDS = [
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
].join(',');

export class BestBuyClient extends BaseRetailerClient {
	get slug(): string {
		return 'bestbuy';
	}

	protected setupHeaders(): void {
		this.headers = {
			Accept: 'application/json',
			'User-Agent': 'TheFrugalist/1.0',
		};
		// The Laravel version had the X-API-Key header commented out - Best Buy
		// takes the key as a query parameter instead. Left as-is.
	}

	async searchProduct(skuUpc: string): Promise<RetailerProduct | null> {
		// Best Buy's product endpoint takes the lookup as a path-level filter
		// expression, not a query parameter. A 10+ digit numeric value is treated
		// as a UPC, anything else as a SKU.
		const isUpc = /^\d+$/.test(skuUpc) && skuUpc.length >= 10;
		const endpoint = isUpc ? `/v1/products(upc=${skuUpc})` : `/v1/products(sku=${skuUpc})`;

		const result = await this.makeRequest(endpoint, {
			apiKey: this.retailer.apiKey ?? undefined,
			format: 'json',
			show: SHOW_FIELDS,
			pageSize: 1,
			...(isUpc ? { upc: skuUpc } : { sku: skuUpc }),
		});

		if (!result) return null;

		const body = result.json as { products?: unknown[] } | null;
		const products = body?.products;

		if (!Array.isArray(products) || products.length === 0) return null;

		this.capture(endpoint, body, 'Best Buy');

		return this.parseProductData(products[0] as Record<string, unknown>);
	}

	private parseProductData(api: Record<string, unknown>): RetailerProduct {
		const orderable = api.orderable ?? null;
		const onlineAvailable = api.onlineAvailability ?? false;
		const inStoreAvailable = api.inStoreAvailability ?? false;
		const isActive = api.active ?? true;

		// In stock means active, not sold out, and available through some channel.
		const inStock = Boolean(
			isActive && orderable !== 'SoldOut' && (onlineAvailable || inStoreAvailable),
		);

		return this.standardize({
			name: api.name ?? 'Unknown Product',
			variant: api.modelNumber ?? null,
			description: api.longDescription ?? api.shortDescription ?? null,
			image_url: api.image ?? null,
			retail_price: api.regularPrice ?? 0,
			current_price: api.salePrice ?? 0,
			in_stock: inStock,
			sku_upc: api.sku ?? null,
			retailer_url: api.url ?? null,
			metadata: {
				upc: api.upc ?? null,
				model_number: api.modelNumber ?? null,
				manufacturer: api.manufacturer ?? null,
				condition: api.condition ?? null,
				type: api.type ?? null,
				color: api.color ?? null,

				on_sale: api.onSale ?? false,
				clearance: api.clearance ?? false,
				dollar_savings: api.dollarSavings ?? null,
				percent_savings: api.percentSavings ?? null,
				price_update_date: api.priceUpdateDate ?? null,

				active: isActive,
				orderable,
				online_availability: onlineAvailable,
				in_store_availability: inStoreAvailable,
				in_store_pickup: api.inStorePickup ?? false,
				home_delivery: api.homeDelivery ?? false,
				free_shipping: api.freeShipping ?? false,
				free_shipping_eligible: api.freeShippingEligible ?? false,
				quantity_limit: api.quantityLimit ?? null,

				customer_review_average: api.customerReviewAverage ?? null,
				customer_review_count: api.customerReviewCount ?? null,

				retailer_url: api.url ?? null,
			},
		});
	}
}
