import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { serializeRow } from '../db/serialize.js';
import type { AppEnv } from '../http/app.js';
import { HttpError } from '../http/errors.js';
import { auth } from '../lib/auth.js';
import { validate, validated } from '../http/validate.js';

/**
 * Sanctum-shaped auth endpoints, backed by Better Auth.
 *
 * This is not tidiness - it is what makes cutover possible at all.
 *
 * Both clients call the Laravel routes: POST /api/login, /api/register,
 * /api/logout, /api/forgot-password, /api/reset-password,
 * /api/email/verification-notification, and GET /api/user. They expect
 * `{ user, token }` back and store the token for bearer auth. Better Auth
 * instead exposes /api/auth/sign-in/email and friends with a different envelope.
 *
 * The web client could be updated and redeployed on demand. **The mobile client
 * cannot** - the App Store build has its API base URL compiled in and its auth
 * calls hard-coded, so every already-installed copy would fail to sign in the
 * moment traffic moved. Waiting for an app review to complete a backend cutover
 * is not an acceptable coupling.
 *
 * So these routes translate. They are a compatibility layer with a defined end:
 * once both clients have shipped against /api/auth/* and the old mobile builds
 * have aged out, this file is deleted. Until then it is the reason the cutover
 * is reversible and does not need a coordinated client release.
 */

export const authCompatRoutes = new Hono<AppEnv>();

/** Native clients send no Origin; Better Auth needs a trusted one. */
const NATIVE_ORIGIN = 'thefrugalist://';

function forward(c: { req: { raw: Request } }, path: string, body: unknown): Promise<Response> {
	const headers = new Headers(c.req.raw.headers);
	headers.set('Content-Type', 'application/json');

	if (!headers.get('Origin')) headers.set('Origin', NATIVE_ORIGIN);

	return auth().handler(
		new Request(new URL(path, 'http://localhost').toString(), {
			method: 'POST',
			headers,
			body: JSON.stringify(body),
		}),
	);
}

async function userPayload(email: string) {
	const [row] = await db().select().from(users).where(eq(users.email, email)).limit(1);
	if (!row) throw HttpError.unauthenticated();

	// The whole row is safe to return now: credentials live on auth_accounts,
	// and users.password / users.remember_token were dropped with Laravel.
	return serializeRow(row);
}

const loginSchema = z.object({
	email: z.string({ message: 'The email field is required.' }).min(1, 'The email field is required.'),
	password: z
		.string({ message: 'The password field is required.' })
		.min(1, 'The password field is required.'),
});

authCompatRoutes.post('/login', validate('json', loginSchema), async (c) => {
	const data = validated<z.infer<typeof loginSchema>>(c, 'json');

	const response = await forward(c, '/api/auth/sign-in/email', {
		email: data.email,
		password: data.password,
	});

	if (!response.ok) {
		// Laravel threw a ValidationException keyed on `email` for bad
		// credentials, and both clients surface it under that field.
		throw HttpError.field('email', 'The provided credentials are incorrect.');
	}

	const token = response.headers.get('set-auth-token');
	if (!token) throw HttpError.unauthenticated();

	const out = c.json({ user: await userPayload(data.email), token });

	// Carry the session cookie through as well, so the Vue app keeps working
	// whether it uses the cookie or the bearer token.
	copyCookies(response, out);

	return out;
});

const registerSchema = z.object({
	first_name: z
		.string({ message: 'The first name field is required.' })
		.min(1, 'The first name field is required.')
		.max(255),
	last_name: z
		.string({ message: 'The last name field is required.' })
		.min(1, 'The last name field is required.')
		.max(255),
	email: z
		.string({ message: 'The email field is required.' })
		.min(1, 'The email field is required.')
		.email('The email field must be a valid email address.')
		.max(255),
	password: z
		.string({ message: 'The password field is required.' })
		.min(8, 'The password field must be at least 8 characters.'),
	password_confirmation: z.string().optional(),
});

authCompatRoutes.post('/register', validate('json', registerSchema), async (c) => {
	const data = validated<z.infer<typeof registerSchema>>(c, 'json');

	// Laravel's `confirmed` rule. Checked here rather than in the schema so the
	// error lands on `password`, which is where the forms display it.
	if (data.password_confirmation !== undefined && data.password_confirmation !== data.password) {
		throw HttpError.field('password', 'The password field confirmation does not match.');
	}

	const [existing] = await db()
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, data.email.toLowerCase()))
		.limit(1);

	if (existing) throw HttpError.field('email', 'The email has already been taken.');

	const response = await forward(c, '/api/auth/sign-up/email', {
		email: data.email.toLowerCase(),
		password: data.password,
		name: `${data.first_name} ${data.last_name}`.trim(),
		firstName: data.first_name,
		lastName: data.last_name,
	});

	if (!response.ok) {
		const detail = await response.text();
		c.get('logger')?.warn({ status: response.status, detail }, 'sign-up rejected');
		throw HttpError.field('email', 'Registration failed. Please try again.');
	}

	const token = response.headers.get('set-auth-token');
	if (!token) throw HttpError.unauthenticated();

	const out = c.json({ user: await userPayload(data.email.toLowerCase()), token }, 201);
	copyCookies(response, out);

	return out;
});

authCompatRoutes.post('/logout', async (c) => {
	const headers = new Headers(c.req.raw.headers);
	if (!headers.get('Origin')) headers.set('Origin', NATIVE_ORIGIN);

	await auth().handler(
		new Request('http://localhost/api/auth/sign-out', { method: 'POST', headers }),
	);

	return c.json({ message: 'Logged out successfully.' });
});

authCompatRoutes.get('/user', async (c) => {
	const user = c.get('user');
	if (!user) throw HttpError.unauthenticated();

	return c.json(await userPayload(user.email));
});

const forgotSchema = z.object({
	email: z
		.string({ message: 'The email field is required.' })
		.min(1, 'The email field is required.')
		.email('The email field must be a valid email address.'),
});

authCompatRoutes.post('/forgot-password', validate('json', forgotSchema), async (c) => {
	const data = validated<z.infer<typeof forgotSchema>>(c, 'json');

	await forward(c, '/api/auth/request-password-reset', {
		email: data.email,
		redirectTo: `${new URL(c.req.url).origin}/reset-password`,
	});

	// Always the same response, whether or not the address exists - Laravel's
	// Password::sendResetLink did the same, and anything else is an account
	// enumeration oracle.
	return c.json({ message: 'Password reset link sent to your email.' });
});

const resetSchema = z.object({
	token: z.string({ message: 'The token field is required.' }).min(1, 'The token field is required.'),
	email: z.string().optional(),
	password: z
		.string({ message: 'The password field is required.' })
		.min(8, 'The password field must be at least 8 characters.'),
	password_confirmation: z.string().optional(),
});

authCompatRoutes.post('/reset-password', validate('json', resetSchema), async (c) => {
	const data = validated<z.infer<typeof resetSchema>>(c, 'json');

	if (data.password_confirmation !== undefined && data.password_confirmation !== data.password) {
		throw HttpError.field('password', 'The password field confirmation does not match.');
	}

	const response = await forward(c, '/api/auth/reset-password', {
		token: data.token,
		newPassword: data.password,
	});

	if (!response.ok) {
		throw HttpError.field('email', 'This password reset token is invalid.');
	}

	return c.json({ message: 'Password has been reset successfully.' });
});

authCompatRoutes.post('/email/verification-notification', async (c) => {
	const user = c.get('user');
	if (!user) throw HttpError.unauthenticated();

	const [row] = await db()
		.select({ verifiedAt: users.emailVerifiedAt })
		.from(users)
		.where(eq(users.id, user.id))
		.limit(1);

	if (row?.verifiedAt) {
		return c.json({ message: 'Email already verified.' });
	}

	await forward(c, '/api/auth/send-verification-email', {
		email: user.email,
		callbackURL: '/email-verified',
	});

	return c.json({ message: 'Verification link sent.' });
});

const passwordUpdateSchema = z.object({
	current_password: z
		.string({ message: 'The current password field is required.' })
		.min(1, 'The current password field is required.'),
	password: z
		.string({ message: 'The password field is required.' })
		.min(8, 'The password field must be at least 8 characters.'),
	password_confirmation: z.string().optional(),
});

authCompatRoutes.put('/password', validate('json', passwordUpdateSchema), async (c) => {
	const user = c.get('user');
	if (!user) throw HttpError.unauthenticated();

	const data = validated<z.infer<typeof passwordUpdateSchema>>(c, 'json');

	if (data.password_confirmation !== undefined && data.password_confirmation !== data.password) {
		throw HttpError.field('password', 'The password field confirmation does not match.');
	}

	const response = await forward(c, '/api/auth/change-password', {
		currentPassword: data.current_password,
		newPassword: data.password,
		revokeOtherSessions: false,
	});

	if (!response.ok) {
		// Laravel's `current_password` rule reported on this field.
		throw HttpError.field('current_password', 'The provided password is incorrect.');
	}

	return c.json({ message: 'Password updated successfully.' });
});

function copyCookies(from: Response, to: Response): void {
	for (const cookie of from.headers.getSetCookie?.() ?? []) {
		to.headers.append('Set-Cookie', cookie);
	}
}
