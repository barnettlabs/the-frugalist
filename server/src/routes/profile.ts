import { HttpError } from '@frugalist/contracts';
import { and, eq, ne } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import type { AppEnv } from '../http/app.js';
import { currentUser, requireAuth } from '../http/auth-middleware.js';
import { laravelRules as r } from '../http/rules.js';
import { validate, validated } from '../http/validate.js';

/**
 * Profile read, update and account deletion.
 *
 * Ports App\Http\Controllers\ProfileController and ProfileUpdateRequest. Two
 * details are contract, not preference:
 *
 *   - The response is a hand-picked subset of columns, not the user row. It
 *     deliberately excludes the password hash, is_admin and the verification
 *     timestamps, and the clients read exactly these six keys.
 *   - Changing the email clears email_verified_at, so the address has to be
 *     re-verified. Preserved, including the "only when actually changed" check -
 *     re-submitting the same address must not silently unverify the account.
 *
 * Account deletion is left on Laravel for now: it requires current-password
 * confirmation and token revocation, and Better Auth owns credentials in the new
 * service. Noted in MIGRATION.md.
 */

const profileFields = {
	username: users.username,
	avatar_url: users.avatarUrl,
	website: users.website,
	first_name: users.firstName,
	last_name: users.lastName,
	email: users.email,
};

const url = (attribute: string, max: number) =>
	z
		.union([z.string(), z.null()])
		.optional()
		.superRefine((v, ctx) => {
			if (v === null || v === undefined || v === '') return;

			try {
				new URL(v);
			} catch {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `The ${attribute} field must be a valid URL.`,
				});
				return;
			}

			if (v.length > max) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `The ${attribute} field must not be greater than ${max} characters.`,
				});
			}
		});

const updateSchema = z.object({
	name: r.nullableString('name', 255),
	first_name: r.nullableString('first name', 255),
	last_name: r.nullableString('last name', 255),
	username: r.nullableString('username', 255),
	// Required and lowercase, unlike every other field here.
	email: z
		.string({ message: 'The email field is required.' })
		.min(1, 'The email field is required.')
		.max(255, 'The email field must not be greater than 255 characters.')
		.email('The email field must be a valid email address.')
		.refine((v) => v === v.toLowerCase(), {
			message: 'The email field must be lowercase.',
		}),
	avatar_url: url('avatar url', 255),
	website: url('website', 255),
});

type ProfileUpdate = z.infer<typeof updateSchema>;

export const profileRoutes = new Hono<AppEnv>();

profileRoutes.use('*', requireAuth);

profileRoutes.get('/', async (c) => {
	const user = currentUser(c);

	const [row] = await db().select(profileFields).from(users).where(eq(users.id, user.id)).limit(1);

	if (!row) throw HttpError.notFound();

	return c.json(row);
});

profileRoutes.put('/', validate('json', updateSchema), async (c) => {
	const user = currentUser(c);
	const data = validated<ProfileUpdate>(c, 'json');

	// Zod cannot express `unique:users,email,{id}` - it needs the database. Both
	// checks return the same 422 envelope Laravel's Rule::unique produced.
	await assertUnique(users.email, data.email, user.id, 'email');

	if (data.username !== null && data.username !== undefined) {
		await assertUnique(users.username, data.username, user.id, 'username');
	}

	const [existing] = await db()
		.select({ email: users.email })
		.from(users)
		.where(eq(users.id, user.id))
		.limit(1);

	const emailChanged = existing?.email !== data.email;

	const patch: Record<string, unknown> = { updatedAt: new Date() };

	for (const [key, value] of Object.entries(data)) {
		if (value === undefined) continue;
		patch[key.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase())] = value;
	}

	if (emailChanged) {
		// isDirty('email') in the original. A new address is unverified until
		// proven, and re-submitting the same one must not unverify the account.
		patch.emailVerifiedAt = null;
		patch.emailVerified = false;
	}

	await db().update(users).set(patch).where(eq(users.id, user.id));

	const [row] = await db().select(profileFields).from(users).where(eq(users.id, user.id)).limit(1);

	return c.json(row);
});

async function assertUnique(
	column: typeof users.email | typeof users.username,
	value: string,
	ignoreUserId: number,
	field: string,
): Promise<void> {
	const [clash] = await db()
		.select({ id: users.id })
		.from(users)
		.where(and(eq(column, value), ne(users.id, ignoreUserId)))
		.limit(1);

	if (clash) {
		throw HttpError.field(field, `The ${field} has already been taken.`);
	}
}
