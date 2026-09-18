import { eq } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { userDevices } from '../../db/schema.js';
import { logger } from '../../lib/logger.js';

/**
 * Expo push notifications.
 *
 * Ports App\Services\ExpoPushService. The analysis suggested replacing this
 * with expo-server-sdk, which would delete most of it and add receipt handling
 * - but that is a behaviour change (chunking and receipts alter what gets sent
 * and when), so the hand-rolled client is ported as-is first and swapped in its
 * own commit afterwards. Tracked in MIGRATION.md.
 *
 * The important behaviour to keep is token hygiene: Expo returns a per-message
 * ticket, and a DeviceNotRegistered error means the app was uninstalled. Those
 * tokens get deactivated, otherwise every future send retries a dead device
 * forever.
 */

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export type PushResult =
	| { success: true; data: unknown }
	| { success: false; error: string; status?: number };

type ExpoTicket = {
	status?: string;
	message?: string;
	details?: { error?: string };
};

export type AlertType = 'target_reached' | 'price_drop' | 'back_in_stock' | string;

function isValidExpoToken(token: string): boolean {
	return token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[');
}

export async function sendPush(
	tokens: string | string[],
	title: string,
	body: string,
	data: Record<string, unknown> = {},
): Promise<PushResult> {
	const log = logger();
	const candidates = (Array.isArray(tokens) ? tokens : [tokens]).filter(isValidExpoToken);

	if (candidates.length === 0) {
		return { success: false, error: 'No valid Expo push tokens provided' };
	}

	const messages = candidates.map((to) => ({
		to,
		title,
		body,
		data,
		sound: 'default',
		priority: 'high',
	}));

	try {
		const response = await fetch(EXPO_PUSH_URL, {
			method: 'POST',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
			body: JSON.stringify(messages),
		});

		if (!response.ok) {
			const text = await response.text();
			log.error({ status: response.status, body: text.slice(0, 2000) }, 'expo push failed');
			return {
				success: false,
				error: 'Failed to send push notification',
				status: response.status,
			};
		}

		const payload = (await response.json()) as { data?: ExpoTicket[] };
		await processTickets(payload, candidates);

		return { success: true, data: payload };
	} catch (err) {
		log.error({ err }, 'expo push threw');
		return { success: false, error: err instanceof Error ? err.message : String(err) };
	}
}

async function processTickets(
	payload: { data?: ExpoTicket[] },
	tokens: string[],
): Promise<void> {
	if (!Array.isArray(payload.data)) return;

	const log = logger();

	for (const [index, ticket] of payload.data.entries()) {
		if (ticket?.status !== 'error') continue;

		const token = tokens[index];

		log.warn(
			{ token, error: ticket.message ?? 'Unknown error', details: ticket.details },
			'expo push token error',
		);

		// DeviceNotRegistered means the app was uninstalled; InvalidCredentials
		// means the token can never work. Either way, stop sending to it.
		const reason = ticket.details?.error;
		if (token && (reason === 'DeviceNotRegistered' || reason === 'InvalidCredentials')) {
			await deactivateToken(token);
		}
	}
}

async function deactivateToken(token: string): Promise<void> {
	await db().update(userDevices).set({ isActive: false }).where(eq(userDevices.pushToken, token));
	logger().info({ token }, 'deactivated invalid push token');
}

/** Ports sendPriceDropAlert, including its exact copy and number formatting. */
export async function sendPriceDropPush(
	tokens: string[],
	productName: string,
	currentPrice: number,
	previousPrice: number,
	alertType: AlertType,
	trackedProductId: number,
): Promise<PushResult> {
	const money = (value: number) => value.toFixed(2);

	const title =
		alertType === 'target_reached'
			? 'Target Price Reached!'
			: alertType === 'price_drop'
				? 'Price Drop Alert!'
				: alertType === 'back_in_stock'
					? 'Back in Stock!'
					: 'Price Alert';

	const body =
		alertType === 'target_reached'
			? `${productName} is now $${money(currentPrice)} - your target price!`
			: alertType === 'price_drop'
				? `${productName} dropped to $${money(currentPrice)} (was $${money(previousPrice)})`
				: alertType === 'back_in_stock'
					? `${productName} is back in stock at $${money(currentPrice)}!`
					: `${productName}: $${money(currentPrice)}`;

	return sendPush(tokens, title, body, {
		type: 'price_alert',
		alert_type: alertType,
		tracked_product_id: trackedProductId,
		current_price: currentPrice,
		previous_price: previousPrice,
	});
}
