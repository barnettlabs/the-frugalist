import { asc, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '../db/client.js';
import { announcements, bugReports, retailers } from '../db/schema.js';
import { serializeRow, serializeRows } from '../db/serialize.js';
import type { AppEnv } from '../http/app.js';
import { HttpError } from '../http/errors.js';
import { parseId } from '../http/ownership.js';
import { validate, validated } from '../http/validate.js';

/**
 * Endpoints that do not require authentication.
 *
 * Announcements and retailers were public in the Laravel app, and the SEO work
 * depends on them staying that way - the prerendered pages fetch them. A
 * logged-in user is resolved by the session middleware but never required.
 */

export const publicRoutes = new Hono<AppEnv>();

publicRoutes.get('/announcements', async (c) => {
	const rows = await db()
		.select()
		.from(announcements)
		.orderBy(desc(announcements.createdAt), desc(announcements.id));

	return c.json(serializeRows(rows));
});

publicRoutes.get('/announcements/:id', async (c) => {
	const [row] = await db()
		.select()
		.from(announcements)
		.where(eq(announcements.id, parseId(c.req.param('id'))))
		.limit(1);

	if (!row) throw HttpError.notFound();

	return c.json(serializeRow(row));
});

/**
 * Public retailer list, wrapped in { retailers } as the inline closure in
 * routes/api.php was.
 *
 * The columns are listed explicitly, and that is the whole point of this
 * handler. The Retailer model declared api_base_url, api_key, api_config and
 * rate_limit_per_hour in $hidden, and the admin controller opted back in with
 * makeVisible() - so serialisation, not the query, was what kept credentials
 * out of this response.
 *
 * Drizzle has no equivalent of $hidden: a bare select() returns every column
 * and the serialiser will happily emit it. A first cut of this route did
 * exactly that and published every retailer's API key to unauthenticated
 * callers. Selecting explicitly makes the boundary something you can see while
 * reading the handler rather than something inherited from a model two files
 * away.
 */
const retailerPublicColumns = {
	id: retailers.id,
	name: retailers.name,
	slug: retailers.slug,
	logo_url: retailers.logoUrl,
	is_active: retailers.isActive,
	coming_soon: retailers.comingSoon,
	created_at: retailers.createdAt,
	updated_at: retailers.updatedAt,
};

publicRoutes.get('/retailers', async (c) => {
	const rows = await db().select(retailerPublicColumns).from(retailers).orderBy(asc(retailers.name));

	return c.json({ retailers: serializeRows(rows) });
});

/**
 * Bug reports.
 *
 * The Laravel route lived in web.php and answered with a session redirect
 * (`back()->with('success')`), which is useless to an API client - the Vue app
 * posts here with XHR and reads nothing back. It returns JSON here instead, and
 * a 201 with the created id, which is what an API should do. That is a
 * deliberate improvement rather than a port; the web client ignores the body
 * either way, so nothing breaks.
 *
 * user_id is nullable: the original used Auth::id(), which is null for a guest,
 * so anonymous reports were allowed and still are.
 */
const bugReportSchema = z.object({
	subject: z
		.string({ message: 'The subject field is required.' })
		.min(1, 'The subject field is required.')
		.max(255, 'The subject field must not be greater than 255 characters.'),
	description: z
		.string({ message: 'The description field is required.' })
		.min(1, 'The description field is required.')
		.max(2000, 'The description field must not be greater than 2000 characters.'),
	page_url: z
		.string({ message: 'The page url field is required.' })
		.min(1, 'The page url field is required.')
		.max(500, 'The page url field must not be greater than 500 characters.'),
	metadata: z.union([z.record(z.string(), z.unknown()), z.array(z.unknown()), z.null()]).optional(),
});

publicRoutes.post('/bug-reports', validate('json', bugReportSchema), async (c) => {
	const data = validated<z.infer<typeof bugReportSchema>>(c, 'json');
	const user = c.get('user');
	const now = new Date();

	const [row] = await db()
		.insert(bugReports)
		.values({
			userId: user ? user.id : null,
			subject: data.subject,
			description: data.description,
			pageUrl: data.page_url,
			metadata: data.metadata ?? null,
			createdAt: now,
			updatedAt: now,
		} as typeof bugReports.$inferInsert)
		.returning();

	return c.json(
		{
			bug_report: serializeRow(row as Record<string, unknown>),
			message: 'Bug report submitted successfully. Thank you for your feedback!',
		},
		201,
	);
});
