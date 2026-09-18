import type { Logger } from 'pino';

import { logger } from '../../lib/logger.js';
import type { DebugCapture, RetailerClient, RetailerConfig, RetailerProduct } from './types.js';

/**
 * Shared retailer client behaviour.
 *
 * Ports App\Services\Retailers\BaseRetailerService, including the two
 * behaviours the price-check job depends on:
 *
 *   - A failed request returns null rather than throwing. The Laravel version
 *     caught everything, logged it and returned null, so a single retailer
 *     outage degraded to "product not found" instead of failing the whole run.
 *     That is load-bearing: the job checks many products per run.
 *   - `standardize` applies defaults for every key, so a sparse upstream
 *     response still produces a complete record.
 */
export abstract class BaseRetailerClient implements RetailerClient {
	protected readonly retailer: RetailerConfig;
	protected readonly log: Logger;
	protected headers: Record<string, string> = {};
	protected debugMode = false;
	protected lastRawResponse: DebugCapture = null;

	/** Matches the 30-second timeout on Laravel's Http::timeout(30). */
	protected static readonly TIMEOUT_MS = 30_000;

	constructor(retailer: RetailerConfig) {
		this.retailer = retailer;
		this.log = logger().child({ retailer: retailer.slug });
		this.setupHeaders();
	}

	abstract get slug(): string;
	protected abstract setupHeaders(): void;
	abstract searchProduct(skuUpc: string): Promise<RetailerProduct | null>;

	async getProductDetails(skuUpc: string): Promise<RetailerProduct | null> {
		return this.searchProduct(skuUpc);
	}

	async validateProduct(skuUpc: string): Promise<boolean> {
		return (await this.getProductDetails(skuUpc)) !== null;
	}

	setDebugMode(enabled: boolean): this {
		this.debugMode = enabled;
		return this;
	}

	getLastRawResponse(): DebugCapture {
		return this.lastRawResponse;
	}

	/**
	 * GET with query params. Returns parsed JSON, or null on any failure.
	 *
	 * Errors are logged and swallowed deliberately - see the class comment.
	 */
	protected async makeRequest(
		endpoint: string,
		params: Record<string, string | number | undefined> = {},
	): Promise<{ json: unknown; url: string } | null> {
		const url = new URL(this.retailer.apiBaseUrl + endpoint);

		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null) {
				url.searchParams.set(key, String(value));
			}
		}

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), BaseRetailerClient.TIMEOUT_MS);

		try {
			const response = await fetch(url, {
				headers: this.headers,
				signal: controller.signal,
			});

			if (!response.ok) {
				this.log.error(
					{ endpoint, status: response.status, body: (await response.text()).slice(0, 2000) },
					'retailer API request failed',
				);
				return null;
			}

			return { json: await response.json(), url: url.toString() };
		} catch (err) {
			// AbortError from the timeout lands here too, which is what we want -
			// a slow retailer must not stall the whole run.
			this.log.error({ endpoint, err }, 'retailer API request threw');
			return null;
		} finally {
			clearTimeout(timeout);
		}
	}

	/** Ports standardizeProductData, defaults included. */
	protected standardize(data: Record<string, unknown>): RetailerProduct {
		return {
			name: asString(data.name) ?? 'Unknown Product',
			variant: asString(data.variant),
			description: asString(data.description),
			image_url: asString(data.image_url),
			retail_price: asFloat(data.retail_price),
			current_price: asFloat(data.current_price),
			in_stock: Boolean(data.in_stock ?? false),
			sku_upc: asString(data.sku_upc),
			retailer_url: asString(data.retailer_url),
			metadata: (data.metadata as Record<string, unknown>) ?? {},
		};
	}

	protected capture(endpoint: string, response: unknown, displayName: string): void {
		if (!this.debugMode) return;

		this.lastRawResponse = {
			retailer: displayName,
			endpoint: this.retailer.apiBaseUrl + endpoint,
			response,
		};
	}
}

function asString(value: unknown): string | null {
	if (value === null || value === undefined || value === '') return null;
	return String(value);
}

/** PHP's `(float)` cast: non-numeric becomes 0 rather than NaN. */
function asFloat(value: unknown): number {
	if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
	if (typeof value === 'string') {
		const parsed = Number.parseFloat(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}
	return 0;
}
