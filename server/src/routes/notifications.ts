import { and, desc, eq, isNull } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '../db/client.js';
import { notifications } from '../db/schema.js';
import { serializeRow, serializeRows } from '../db/serialize.js';
import type { AppEnv } from '../http/app.js';
import { currentUser, requireAuth } from '../http/auth-middleware.js';
import { findOwned, parseId } from '../http/ownership.js';

/** Port of App\Http\Controllers\NotificationController. */

export const notificationRoutes = new Hono<AppEnv>();

notificationRoutes.use('*', requireAuth);

notificationRoutes.get('/', async (c) => {
	const user = currentUser(c);

	const rows = await db()
		.select()
		.from(notifications)
		.where(eq(notifications.userId, user.id))
		.orderBy(desc(notifications.createdAt), desc(notifications.id));

	return c.json(serializeRows(rows));
});

/**
 * Registered before /:id so "read-all" is not parsed as an id.
 *
 * Laravel's router matched on definition order too, and the original declared
 * this route first for the same reason. Hono matches in registration order, so
 * the ordering here is load-bearing rather than stylistic.
 */
notificationRoutes.post('/read-all', async (c) => {
	const user = currentUser(c);

	await db()
		.update(notifications)
		.set({ readAt: new Date(), updatedAt: new Date() })
		.where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));

	return c.json({ message: 'All notifications marked as read.' });
});

notificationRoutes.get('/:id', async (c) => {
	const row = await findOwned(notifications, {
		id: parseId(c.req.param('id')),
		user: currentUser(c),
		idColumn: notifications.id,
		userIdColumn: notifications.userId,
		onForeign: 'forbidden',
	});

	return c.json(serializeRow(row));
});

notificationRoutes.post('/:id/read', async (c) => {
	const row = await findOwned(notifications, {
		id: parseId(c.req.param('id')),
		user: currentUser(c),
		idColumn: notifications.id,
		userIdColumn: notifications.userId,
		onForeign: 'forbidden',
	});

	// markAsRead() was idempotent - it set read_at unconditionally - so a second
	// call refreshes the timestamp rather than erroring.
	const [updated] = await db()
		.update(notifications)
		.set({ readAt: new Date(), updatedAt: new Date() })
		.where(eq(notifications.id, row.id))
		.returning();

	return c.json(serializeRow(updated!));
});
