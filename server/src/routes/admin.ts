import { and, asc, desc, eq, ilike, ne, or, type SQL } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '../db/client.js';
import { announcements, bugReports, retailers, users } from '../db/schema.js';
import { serializeRow, serializeRows } from '../db/serialize.js';
import type { AppEnv } from '../http/app.js';
import { currentUser, requireAdmin } from '../http/auth-middleware.js';
import { HttpError } from '../http/errors.js';
import { parseId } from '../http/ownership.js';
import { pageFromQuery, paginate } from '../http/paginate.js';
import { validate, validated } from '../http/validate.js';
import { availableRetailerSlugs } from '../services/retailers/factory.js';

/**
 * Admin surface. Ports the controllers under App\Http\Controllers\Admin.
 *
 * Every route is behind requireAdmin, mirroring the `admin` middleware group -
 * applied once to the router rather than per-handler, so a new route cannot be
 * added unprotected by omission.
 *
 * Responses keep their singular/plural envelopes ({ retailer } vs
 * { retailers }) and the paginator shape, because the admin UI types against
 * them.
 */

export const adminRoutes = new Hono<AppEnv>();

adminRoutes.use('*', requireAdmin);

// ---------------------------------------------------------------- retailers

/**
 * The retailer columns the admin UI needs and the public endpoint must not
 * expose. The Laravel model kept these in $hidden and the admin controller
 * called makeVisible() - so the public /retailers route hides the API key while
 * this one shows it. Selecting explicitly makes that boundary visible rather
 * than depending on a model-level default.
 */
const retailerAdminColumns = {
	id: retailers.id,
	name: retailers.name,
	slug: retailers.slug,
	logo_url: retailers.logoUrl,
	is_active: retailers.isActive,
	coming_soon: retailers.comingSoon,
	api_base_url: retailers.apiBaseUrl,
	api_key: retailers.apiKey,
	api_config: retailers.apiConfig,
	rate_limit_per_hour: retailers.rateLimitPerHour,
	created_at: retailers.createdAt,
	updated_at: retailers.updatedAt,
};

const retailerStoreSchema = z.object({
	name: z
		.string({ message: 'The name field is required.' })
		.min(1, 'The name field is required.')
		.max(255, 'The name field must not be greater than 255 characters.'),
	slug: z
		.string({ message: 'The slug field is required.' })
		.min(1, 'The slug field is required.')
		.max(255, 'The slug field must not be greater than 255 characters.')
		.regex(/^[A-Za-z0-9_-]+$/, 'The slug field must only contain letters, numbers, dashes and underscores.')
		.refine((v) => availableRetailerSlugs().includes(v), {
			// Message preserved verbatim - the admin UI shows it, and it tells the
			// operator exactly what to do next.
			message:
				'No service class is registered for that slug. Add it to RetailerServiceFactory first.',
		}),
	logo_url: z.union([z.string().max(1000), z.null()]).optional(),
	api_base_url: z
		.string({ message: 'The api base url field is required.' })
		.min(1, 'The api base url field is required.')
		.max(1000, 'The api base url field must not be greater than 1000 characters.'),
	api_key: z.union([z.string().max(1000), z.null()]).optional(),
	api_config: z.union([z.record(z.string(), z.unknown()), z.null()]).optional(),
	is_active: z.boolean().optional(),
	coming_soon: z.boolean().optional(),
	rate_limit_per_hour: z.number().int().min(0).optional(),
});

const retailerUpdateSchema = retailerStoreSchema.partial();

adminRoutes.get('/retailers/available-slugs', async (c) => {
	const registered = availableRetailerSlugs();
	const taken = (await db().select({ slug: retailers.slug }).from(retailers)).map((r) => r.slug);

	return c.json({
		registered,
		available: registered.filter((slug) => !taken.includes(slug)),
	});
});

adminRoutes.get('/retailers', async (c) => {
	const rows = await db()
		.select(retailerAdminColumns)
		.from(retailers)
		.orderBy(asc(retailers.name));

	return c.json({ retailers: serializeRows(rows) });
});

adminRoutes.get('/retailers/:id', async (c) => {
	const [row] = await db()
		.select(retailerAdminColumns)
		.from(retailers)
		.where(eq(retailers.id, parseId(c.req.param('id'))))
		.limit(1);

	if (!row) throw HttpError.notFound();

	return c.json({ retailer: serializeRow(row) });
});

adminRoutes.post('/retailers', validate('json', retailerStoreSchema), async (c) => {
	const data = validated<z.infer<typeof retailerStoreSchema>>(c, 'json');

	await assertRetailerUnique(retailers.name, data.name, 'name', null);
	await assertRetailerUnique(retailers.slug, data.slug, 'slug', null);

	const now = new Date();

	const [created] = await db()
		.insert(retailers)
		.values({
			name: data.name,
			slug: data.slug,
			logoUrl: data.logo_url ?? null,
			apiBaseUrl: data.api_base_url,
			apiKey: data.api_key ?? null,
			apiConfig: data.api_config ?? null,
			isActive: data.is_active ?? true,
			comingSoon: data.coming_soon ?? false,
			rateLimitPerHour: data.rate_limit_per_hour ?? 100,
			createdAt: now,
			updatedAt: now,
		} as typeof retailers.$inferInsert)
		.returning(retailerAdminColumns);

	return c.json({ retailer: serializeRow(created!) }, 201);
});

adminRoutes.put('/retailers/:id', validate('json', retailerUpdateSchema), async (c) => {
	const id = parseId(c.req.param('id'));
	const data = validated<z.infer<typeof retailerUpdateSchema>>(c, 'json');

	if (data.name !== undefined) await assertRetailerUnique(retailers.name, data.name, 'name', id);
	if (data.slug !== undefined) await assertRetailerUnique(retailers.slug, data.slug, 'slug', id);

	const patch: Record<string, unknown> = { updatedAt: new Date() };
	const map: Record<string, string> = {
		name: 'name',
		slug: 'slug',
		logo_url: 'logoUrl',
		api_base_url: 'apiBaseUrl',
		api_key: 'apiKey',
		api_config: 'apiConfig',
		is_active: 'isActive',
		coming_soon: 'comingSoon',
		rate_limit_per_hour: 'rateLimitPerHour',
	};

	for (const [key, column] of Object.entries(map)) {
		const value = (data as Record<string, unknown>)[key];
		if (value !== undefined) patch[column] = value;
	}

	const [updated] = await db()
		.update(retailers)
		.set(patch)
		.where(eq(retailers.id, id))
		.returning(retailerAdminColumns);

	if (!updated) throw HttpError.notFound();

	return c.json({ retailer: serializeRow(updated) });
});

adminRoutes.delete('/retailers/:id', async (c) => {
	const id = parseId(c.req.param('id'));
	const deleted = await db().delete(retailers).where(eq(retailers.id, id)).returning({ id: retailers.id });

	if (deleted.length === 0) throw HttpError.notFound();

	return c.json({ message: 'Retailer deleted.' });
});

async function assertRetailerUnique(
	column: PgColumn,
	value: string,
	field: string,
	ignoreId: number | null,
): Promise<void> {
	const conditions: SQL[] = [eq(column, value)];
	if (ignoreId !== null) conditions.push(ne(retailers.id, ignoreId));

	const [clash] = await db()
		.select({ id: retailers.id })
		.from(retailers)
		.where(and(...conditions))
		.limit(1);

	if (clash) throw HttpError.field(field, `The ${field} has already been taken.`);
}

// ------------------------------------------------------------ announcements

const announcementSchema = z.object({
	title: z.union([z.string().max(255), z.null()]).optional(),
	message: z.union([z.string().max(5000), z.null()]).optional(),
});

adminRoutes.get('/announcements', async (c) => {
	const rows = await db()
		.select()
		.from(announcements)
		.orderBy(desc(announcements.createdAt), desc(announcements.id));

	return c.json({ announcements: serializeRows(rows) });
});

adminRoutes.get('/announcements/:id', async (c) => {
	const [row] = await db()
		.select()
		.from(announcements)
		.where(eq(announcements.id, parseId(c.req.param('id'))))
		.limit(1);

	if (!row) throw HttpError.notFound();

	return c.json({ announcement: serializeRow(row) });
});

adminRoutes.post('/announcements', validate('json', announcementSchema), async (c) => {
	const data = validated<z.infer<typeof announcementSchema>>(c, 'json');
	const now = new Date();

	const [created] = await db()
		.insert(announcements)
		.values({
			title: data.title ?? null,
			message: data.message ?? null,
			createdAt: now,
			updatedAt: now,
		} as typeof announcements.$inferInsert)
		.returning();

	return c.json({ announcement: serializeRow(created!) }, 201);
});

adminRoutes.put('/announcements/:id', validate('json', announcementSchema), async (c) => {
	const data = validated<z.infer<typeof announcementSchema>>(c, 'json');
	const patch: Record<string, unknown> = { updatedAt: new Date() };

	if (data.title !== undefined) patch.title = data.title;
	if (data.message !== undefined) patch.message = data.message;

	const [updated] = await db()
		.update(announcements)
		.set(patch)
		.where(eq(announcements.id, parseId(c.req.param('id'))))
		.returning();

	if (!updated) throw HttpError.notFound();

	return c.json({ announcement: serializeRow(updated) });
});

adminRoutes.delete('/announcements/:id', async (c) => {
	const deleted = await db()
		.delete(announcements)
		.where(eq(announcements.id, parseId(c.req.param('id'))))
		.returning({ id: announcements.id });

	if (deleted.length === 0) throw HttpError.notFound();

	return c.json({ message: 'Announcement deleted.' });
});

// -------------------------------------------------------------------- users

const userUpdateSchema = z.object({
	is_admin: z.boolean().optional(),
	first_name: z.string().max(255).optional(),
	last_name: z.string().max(255).optional(),
	email: z.string().email('The email field must be a valid email address.').max(255).optional(),
});

adminRoutes.get('/users', async (c) => {
	const search = c.req.query('search');

	const where = search
		? or(
				ilike(users.email, `%${search}%`),
				ilike(users.firstName, `%${search}%`),
				ilike(users.lastName, `%${search}%`),
			)
		: undefined;

	const page = await paginate({
		table: users,
		where,
		orderBy: [desc(users.createdAt), desc(users.id)],
		page: pageFromQuery(c.req.query('page')),
		// The password hash must never reach the admin UI.
		columns: {
			id: users.id,
			email: users.email,
			first_name: users.firstName,
			last_name: users.lastName,
			username: users.username,
			is_admin: users.isAdmin,
			email_verified_at: users.emailVerifiedAt,
			phone_number: users.phoneNumber,
			phone_verified_at: users.phoneVerifiedAt,
			created_at: users.createdAt,
			updated_at: users.updatedAt,
		},
	});

	return c.json({ users: { ...page, data: serializeRows(page.data) } });
});

adminRoutes.get('/users/:id', async (c) => {
	const [row] = await db()
		.select({
			id: users.id,
			email: users.email,
			first_name: users.firstName,
			last_name: users.lastName,
			username: users.username,
			is_admin: users.isAdmin,
			email_verified_at: users.emailVerifiedAt,
			phone_number: users.phoneNumber,
			phone_verified_at: users.phoneVerifiedAt,
			created_at: users.createdAt,
			updated_at: users.updatedAt,
		})
		.from(users)
		.where(eq(users.id, parseId(c.req.param('id'))))
		.limit(1);

	if (!row) throw HttpError.notFound();

	return c.json({ user: serializeRow(row) });
});

adminRoutes.patch('/users/:id', validate('json', userUpdateSchema), async (c) => {
	const actor = currentUser(c);
	const id = parseId(c.req.param('id'));
	const data = validated<z.infer<typeof userUpdateSchema>>(c, 'json');

	/*
	 * An admin cannot demote themselves.
	 *
	 * Preserved from the original, and worth keeping: with a small number of
	 * admins, self-demotion can leave nobody able to administer the system.
	 * Returns 422 rather than 403 because the message belongs to the is_admin
	 * field in the form.
	 */
	if (data.is_admin === false && id === actor.id) {
		throw HttpError.validation(
			{ is_admin: ['You cannot remove your own admin access.'] },
			'You cannot remove your own admin access.',
		);
	}

	if (data.email !== undefined) {
		const [clash] = await db()
			.select({ id: users.id })
			.from(users)
			.where(and(eq(users.email, data.email), ne(users.id, id)))
			.limit(1);

		if (clash) throw HttpError.field('email', 'The email has already been taken.');
	}

	const patch: Record<string, unknown> = { updatedAt: new Date() };
	if (data.is_admin !== undefined) patch.isAdmin = data.is_admin;
	if (data.first_name !== undefined) patch.firstName = data.first_name;
	if (data.last_name !== undefined) patch.lastName = data.last_name;
	if (data.email !== undefined) patch.email = data.email;

	const [updated] = await db()
		.update(users)
		.set(patch)
		.where(eq(users.id, id))
		.returning({
			id: users.id,
			email: users.email,
			first_name: users.firstName,
			last_name: users.lastName,
			username: users.username,
			is_admin: users.isAdmin,
			created_at: users.createdAt,
			updated_at: users.updatedAt,
		});

	if (!updated) throw HttpError.notFound();

	return c.json({ user: serializeRow(updated) });
});

// -------------------------------------------------------------- bug reports

const BUG_STATUSES = ['new', 'in_progress', 'resolved', 'closed'] as const;

const bugReportUpdateSchema = z.object({
	status: z.enum(BUG_STATUSES, { message: 'The selected status is invalid.' }),
});

adminRoutes.get('/bug-reports', async (c) => {
	const status = c.req.query('status');

	const page = await paginate({
		table: bugReports,
		where: status ? eq(bugReports.status, status) : undefined,
		orderBy: [desc(bugReports.createdAt), desc(bugReports.id)],
		page: pageFromQuery(c.req.query('page')),
	});

	// The original eager-loaded user:id,email,first_name,last_name. Attached per
	// row rather than joined, so the paginator count stays correct.
	const reporterIds = [...new Set(page.data.map((r) => (r as { userId?: number }).userId).filter(Boolean))];

	const reporters = reporterIds.length
		? await db()
				.select({
					id: users.id,
					email: users.email,
					first_name: users.firstName,
					last_name: users.lastName,
				})
				.from(users)
		: [];

	const byId = new Map(reporters.map((u) => [Number(u.id), u]));

	return c.json({
		bug_reports: {
			...page,
			data: page.data.map((row) => {
				const userId = (row as { userId?: number }).userId;
				return {
					...serializeRow(row),
					user: userId ? (serializeRow(byId.get(Number(userId)) ?? {}) ?? null) : null,
				};
			}),
		},
	});
});

adminRoutes.get('/bug-reports/:id', async (c) => {
	const [row] = await db()
		.select()
		.from(bugReports)
		.where(eq(bugReports.id, parseId(c.req.param('id'))))
		.limit(1);

	if (!row) throw HttpError.notFound();

	return c.json({ bug_report: serializeRow(row) });
});

adminRoutes.put('/bug-reports/:id', validate('json', bugReportUpdateSchema), async (c) => {
	const data = validated<z.infer<typeof bugReportUpdateSchema>>(c, 'json');

	const [updated] = await db()
		.update(bugReports)
		.set({ status: data.status, updatedAt: new Date() })
		.where(eq(bugReports.id, parseId(c.req.param('id'))))
		.returning();

	if (!updated) throw HttpError.notFound();

	return c.json({ bug_report: serializeRow(updated) });
});

adminRoutes.delete('/bug-reports/:id', async (c) => {
	const deleted = await db()
		.delete(bugReports)
		.where(eq(bugReports.id, parseId(c.req.param('id'))))
		.returning({ id: bugReports.id });

	if (deleted.length === 0) throw HttpError.notFound();

	return c.json({ message: 'Bug report deleted.' });
});
