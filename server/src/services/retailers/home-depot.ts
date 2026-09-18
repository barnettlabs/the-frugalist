import { BaseRetailerClient } from './base.js';
import type { RetailerProduct } from './types.js';

/** Port of App\Services\Retailers\HomeDepotService. */

export class HomeDepotClient extends BaseRetailerClient {
	get slug(): string {
		return 'homedepot';
	}

	protected setupHeaders(): void {
		this.headers = {
			Accept: 'application/json',
			'User-Agent': 'TheFrugalist/1.0',
			'Content-Type': 'application/json',
		};

		if (this.retailer.apiKey) {
			this.headers.Authorization = `Bearer ${this.retailer.apiKey}`;
		}
	}

	async searchProduct(skuUpc: string): Promise<RetailerProduct | null> {
		const endpoint = '/v1/products/search';

		// 12+ digits is treated as a UPC, anything shorter as a SKU. Note the
		// threshold differs from Best Buy's (10), which is in the original.
		const isUpc = /^\d+$/.test(skuUpc) && skuUpc.length >= 12;

		const result = await this.makeRequest(endpoint, {
			format: 'json',
			limit: 1,
			...(isUpc ? { upc: skuUpc } : { sku: skuUpc }),
		});

		if (!result) return null;

		const body = result.json as { products?: unknown[] } | null;
		const products = body?.products;

		if (!Array.isArray(products) || products.length === 0) return null;

		this.capture(endpoint, body, 'Home Depot');

		return this.parseProductData(products[0] as Record<string, unknown>);
	}

	private parseProductData(api: Record<string, unknown>): RetailerProduct {
		const pricing = (api.pricing ?? {}) as Record<string, unknown>;
		const price = pricing.value ?? pricing.special ?? 0;
		const media = (api.media ?? {}) as { images?: { url?: string }[] };
		const availability = (api.availabilityType ?? {}) as { type?: string };

		/*
		 * Carried-over bug, preserved deliberately.
		 *
		 * The Laravel version set a `price` key here, but standardizeProductData
		 * only reads `retail_price` and `current_price` - so every Home Depot
		 * lookup has been returning 0.00 for both. The price is parsed correctly
		 * and then dropped on the floor.
		 *
		 * It is kept bug-for-bug so the port stays verifiable against the old
		 * behaviour. Fixing it is a one-line change (assign to both price keys)
		 * but it is a *behaviour* change - it would start firing price-drop alerts
		 * for Home Depot products that have looked free since the feature shipped
		 * - so it belongs in its own commit, after the migration, with the alert
		 * consequences thought through. Tracked in MIGRATION.md.
		 */
		return this.standardize({
			name: api.itemLabel ?? api.productLabel ?? 'Unknown Product',
			variant: api.modelNumber ?? api.brandName ?? null,
			description: api.productDescription ?? null,
			image_url: media.images?.[0]?.url ?? null,
			price,
			in_stock: availability.type !== 'OUT_OF_STOCK',
			sku_upc: api.internetNumber ?? api.upcGtin13 ?? null,
			retailer_url: api.seoURL ?? null,
			metadata: {
				model_number: api.modelNumber ?? null,
				brand_name: api.brandName ?? null,
				availability_type: api.availabilityType ?? null,
				special_offers: api.specialOffers ?? [],
				store_sku: api.storeSkuNumber ?? null,
				retailer_url: api.seoURL ?? null,
			},
		});
	}
}
