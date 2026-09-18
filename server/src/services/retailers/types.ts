import { z } from 'zod';

/**
 * Standardised product data, as returned by every retailer client.
 *
 * Ports the shape produced by BaseRetailerService::standardizeProductData. The
 * keys and their coercion behaviour are preserved because the price-check job,
 * the price_history.api_response column and the watch-debug endpoints all read
 * this shape.
 */
export const retailerProductSchema = z.object({
	name: z.string(),
	variant: z.string().nullable(),
	description: z.string().nullable(),
	image_url: z.string().nullable(),
	retail_price: z.number(),
	current_price: z.number(),
	in_stock: z.boolean(),
	sku_upc: z.string().nullable(),
	retailer_url: z.string().nullable(),
	metadata: z.record(z.string(), z.unknown()),
});

export type RetailerProduct = z.infer<typeof retailerProductSchema>;

export type RetailerConfig = {
	id: number;
	name: string;
	slug: string;
	apiBaseUrl: string;
	apiKey: string | null;
};

export type DebugCapture = {
	retailer: string;
	endpoint: string;
	response: unknown;
} | null;

export interface RetailerClient {
	readonly slug: string;
	getProductDetails(skuUpc: string): Promise<RetailerProduct | null>;
	searchProduct(skuUpc: string): Promise<RetailerProduct | null>;
	validateProduct(skuUpc: string): Promise<boolean>;
	setDebugMode(enabled: boolean): this;
	getLastRawResponse(): DebugCapture;
}
