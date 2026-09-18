import { BestBuyClient } from './best-buy.js';
import { HomeDepotClient } from './home-depot.js';
import type { RetailerClient, RetailerConfig } from './types.js';

/**
 * Port of App\Services\Retailers\RetailerServiceFactory.
 *
 * The registry is keyed by retailer slug, which is a column on the retailers
 * table - so adding a retailer means adding a client here and a row there. The
 * admin UI reads `availableSlugs` off this list, which is why it stays a single
 * explicit map rather than dynamic resolution.
 */

const CLIENTS: Record<string, new (config: RetailerConfig) => RetailerClient> = {
	bestbuy: BestBuyClient,
	homedepot: HomeDepotClient,
};

export class UnsupportedRetailerError extends Error {
	constructor(name: string) {
		super(`No service available for retailer: ${name}`);
		this.name = 'UnsupportedRetailerError';
	}
}

export function createRetailerClient(retailer: RetailerConfig): RetailerClient {
	const Client = CLIENTS[retailer.slug];

	if (!Client) throw new UnsupportedRetailerError(retailer.name);

	return new Client(retailer);
}

export function availableRetailerSlugs(): string[] {
	return Object.keys(CLIENTS);
}

export function supportsRetailer(slug: string): boolean {
	return slug in CLIENTS;
}
