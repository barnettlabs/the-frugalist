import { desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '../db/client.js';
import { userDevices } from '../db/schema.js';
import { serializeRow, serializeRows } from '../db/serialize.js';
import type { AppEnv } from '../http/app.js';
import { currentUser, requireAuth } from '../http/auth-middleware.js';
import { findOwned, parseId } from '../http/ownership.js';
import { validate, validated } from '../http/validate.js';

/**
 * Push-notification device registry.
 *
 * Ports App\Http\Controllers\UserDeviceController. The registration path is
 * more interesting than it looks: push_token is globally unique, so the same
 * physical device can present a token that already belongs to a different user
 * - after a reinstall, or a handset changing hands. The original handled all
 * three cases and they are preserved, including the differing response
 * messages, which the mobile client displays.
 *
 * Note this endpoint deliberately *reassigns* ownership of an existing token
 * row. That is correct here and not the mass-assignment problem the sheets had:
 * ownership comes from the session, and the token is proof the caller holds the
 * device.
 */

const registerSchema = z.object({
	push_token: z
		.string({ message: 'The push token field is required.' })
		.min(1, 'The push token field is required.')
		.max(500, 'The push token field must not be greater than 500 characters.'),
	device_type: z.enum(['ios', 'android', 'web'], {
		message: 'The selected device type is invalid.',
	}),
	device_name: z
		.union([z.string().max(255, 'The device name field must not be greater than 255 characters.'), z.null()])
		.optional(),
});

const updateSchema = z.object({
	is_active: z.boolean({ message: 'The is active field must be true or false.' }).optional(),
	device_name: z
		.union([z.string().max(255, 'The device name field must not be greater than 255 characters.'), z.null()])
		.optional(),
});

export const deviceRoutes = new Hono<AppEnv>();

deviceRoutes.use('*', requireAuth);

deviceRoutes.get('/', async (c) => {
	const user = currentUser(c);

	const rows = await db()
		.select()
		.from(userDevices)
		.where(eq(userDevices.userId, user.id))
		.orderBy(desc(userDevices.lastUsedAt));

	// Wrapped in { devices }, unlike the sheet endpoints which return a bare
	// array. Inconsistent, but it is what the client reads.
	return c.json({ devices: serializeRows(rows) });
});

deviceRoutes.post('/', validate('json', registerSchema), async (c) => {
	const user = currentUser(c);
	const data = validated<z.infer<typeof registerSchema>>(c, 'json');
	const now = new Date();

	const [existing] = await db()
		.select()
		.from(userDevices)
		.where(eq(userDevices.pushToken, data.push_token))
		.limit(1);

	if (existing) {
		const owned = Number(existing.userId) === user.id;

		const [updated] = await db()
			.update(userDevices)
			.set({
				userId: user.id,
				deviceName: data.device_name ?? existing.deviceName,
				deviceType: data.device_type,
				isActive: true,
				lastUsedAt: now,
				updatedAt: now,
			})
			.where(eq(userDevices.id, existing.id))
			.returning();

		return c.json({
			device: serializeRow(updated!),
			// The original distinguished these two, and the client shows the text.
			message: owned ? 'Device updated successfully.' : 'Device registered successfully.',
		});
	}

	const [created] = await db()
		.insert(userDevices)
		.values({
			userId: user.id,
			pushToken: data.push_token,
			deviceType: data.device_type,
			deviceName: data.device_name ?? null,
			isActive: true,
			lastUsedAt: now,
			createdAt: now,
			updatedAt: now,
		} as typeof userDevices.$inferInsert)
		.returning();

	return c.json({ device: serializeRow(created!), message: 'Device registered successfully.' }, 201);
});

deviceRoutes.put('/:id', validate('json', updateSchema), async (c) => {
	const existing = await findOwned(userDevices, {
		id: parseId(c.req.param('id')),
		user: currentUser(c),
		idColumn: userDevices.id,
		userIdColumn: userDevices.userId,
		onForeign: 'forbidden',
	});

	const data = validated<z.infer<typeof updateSchema>>(c, 'json');

	const patch: Record<string, unknown> = { updatedAt: new Date() };
	if (data.is_active !== undefined) patch.isActive = data.is_active;
	if (data.device_name !== undefined) patch.deviceName = data.device_name;

	const [updated] = await db()
		.update(userDevices)
		.set(patch)
		.where(eq(userDevices.id, existing.id))
		.returning();

	return c.json({ device: serializeRow(updated!), message: 'Device updated successfully.' });
});

deviceRoutes.delete('/:id', async (c) => {
	const existing = await findOwned(userDevices, {
		id: parseId(c.req.param('id')),
		user: currentUser(c),
		idColumn: userDevices.id,
		userIdColumn: userDevices.userId,
		onForeign: 'forbidden',
	});

	await db().delete(userDevices).where(eq(userDevices.id, existing.id));

	return c.json({ message: 'Device removed successfully.' });
});
