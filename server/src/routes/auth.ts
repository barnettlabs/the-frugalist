import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { env } from '../config/env.js';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { serializeRow } from '../db/serialize.js';
import type { AppEnv } from '../http/app.js';
import { HttpError } from '../http/errors.js';
import { auth } from '../lib/auth.js';
import { validate, validated } from '../http/validate.js';

/**
 * The auth endpoints both clients call, backed by Better Auth.
 *
 * POST /login, /register, /logout, /forgot-password, /reset-password and
 * /email/verification-notification, GET /user and PUT /password. Better Auth
 * does the work under /auth/*; these routes give it the API's own shape:
 *
 *   - errors in the 422 envelope, on the field the forms display them under,
 *     where Better Auth answers `{ code, message }`
 *   - `{ user, token }` back from sign-in and sign-up, with the user as the
 *     same snake_case record every other endpoint returns
 *   - first and last name and a password confirmation on sign-up
 *   - one reply to a reset request whether or not the address exists
 *   - email links that land on the web app rather than the API host
 *
 * They began as a bridge for the Laravel-era clients and stayed because that
 * shape is worth keeping; calling Better Auth directly would push all of the
 * above into both clients.
 */

export const authRoutes = new Hono<AppEnv>();

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

/** Where a verified-email link lands once the API has checked the token. */
const verifiedCallbackUrl = () => `${env().WEB_URL}/dashboard?verified=1`;

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

authRoutes.post('/login', validate('json', loginSchema), async (c) => {
	const data = validated<z.infer<typeof loginSchema>>(c, 'json');

	const response = await forward(c, '/auth/sign-in/email', {
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

authRoutes.post('/register', validate('json', registerSchema), async (c) => {
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

	const response = await forward(c, '/auth/sign-up/email', {
		email: data.email.toLowerCase(),
		password: data.password,
		name: `${data.first_name} ${data.last_name}`.trim(),
		firstName: data.first_name,
		lastName: data.last_name,
		// The verification email Better Auth sends on sign-up redirects here.
		callbackURL: verifiedCallbackUrl(),
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

authRoutes.post('/logout', async (c) => {
	const headers = new Headers(c.req.raw.headers);
	if (!headers.get('Origin')) headers.set('Origin', NATIVE_ORIGIN);

	await auth().handler(
		new Request('http://localhost/auth/sign-out', { method: 'POST', headers }),
	);

	return c.json({ message: 'Logged out successfully.' });
});

authRoutes.get('/user', async (c) => {
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

authRoutes.post('/forgot-password', validate('json', forgotSchema), async (c) => {
	const data = validated<z.infer<typeof forgotSchema>>(c, 'json');

	// The link itself is built in lib/auth.ts and points at the web app, so no
	// redirectTo is needed. The old one was this request's own origin - the API
	// host - which has no reset page.
	const response = await forward(c, '/auth/request-password-reset', {
		email: data.email.toLowerCase(),
	});

	if (!response.ok) {
		// Logged, never surfaced: the reply below must not vary.
		c.get('logger')?.error(
			{ status: response.status, detail: await response.text() },
			'password reset request rejected',
		);
	}

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

authRoutes.post('/reset-password', validate('json', resetSchema), async (c) => {
	const data = validated<z.infer<typeof resetSchema>>(c, 'json');

	if (data.password_confirmation !== undefined && data.password_confirmation !== data.password) {
		throw HttpError.field('password', 'The password field confirmation does not match.');
	}

	const response = await forward(c, '/auth/reset-password', {
		token: data.token,
		newPassword: data.password,
	});

	if (!response.ok) {
		throw HttpError.field('email', 'This password reset token is invalid.');
	}

	return c.json({ message: 'Password has been reset successfully.' });
});

authRoutes.post('/email/verification-notification', async (c) => {
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

	await forward(c, '/auth/send-verification-email', {
		email: user.email,
		// A relative path resolved against the API host, which has no such page.
		callbackURL: verifiedCallbackUrl(),
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

authRoutes.put('/password', validate('json', passwordUpdateSchema), async (c) => {
	const user = c.get('user');
	if (!user) throw HttpError.unauthenticated();

	const data = validated<z.infer<typeof passwordUpdateSchema>>(c, 'json');

	if (data.password_confirmation !== undefined && data.password_confirmation !== data.password) {
		throw HttpError.field('password', 'The password field confirmation does not match.');
	}

	const response = await forward(c, '/auth/change-password', {
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
