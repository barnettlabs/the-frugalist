import { verify as verifyBcrypt } from '@node-rs/bcrypt';
import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';

import { env } from '../config/env.js';
import { db } from '../db/client.js';
import * as schema from '../db/schema.js';
import { passwordResetEmail, verificationEmail } from '../services/notifications/auth-emails.js';
import { sendMail } from '../services/notifications/mail.js';
import { logger } from './logger.js';

/**
 * Authentication.
 *
 * Better Auth replaces Sanctum. With only two production accounts, token
 * compatibility stopped being a constraint - which removed the single
 * highest-risk item in this migration. What is preserved instead is the thing
 * that actually matters to those two people: their passwords.
 *
 * Laravel hashed with bcrypt at cost 12. Better Auth hashes with scrypt. Rather
 * than force a reset, `verify` below falls back to bcrypt when it sees a bcrypt
 * hash, so existing credentials keep working and get rehashed to scrypt on the
 * next successful sign-in. The 2026_09_10 Laravel migration backfilled those
 * hashes onto credential account rows, which is where Better Auth looks.
 *
 * Two deliberate shapes:
 *
 *   - `useNumberId` keeps user ids as bigint, so the existing foreign keys from
 *     sheets, tracked products, devices and notifications keep working
 *     untouched. Text ids would have meant re-keying every dependent row.
 *   - The user model maps onto the existing `users` table rather than creating a
 *     second one, and the extra Laravel columns are declared as additional
 *     fields so they survive a round trip.
 */

const BCRYPT_PREFIXES = ['$2a$', '$2b$', '$2y$'];

function looksLikeBcrypt(hash: string): boolean {
	return BCRYPT_PREFIXES.some((p) => hash.startsWith(p));
}

export function createAuth() {
	const config = env();

	return betterAuth({
		appName: 'TheFrugalist',
		baseURL: config.APP_URL,
		secret: config.SESSION_SECRET,
		basePath: '/auth',

		database: drizzleAdapter(db(), {
			provider: 'pg',
			// Keyed by modelName, not by Better Auth's default model keys - the
			// adapter resolves the schema by whatever `modelName` each model is
			// configured with below.
			schema: {
				users: schema.users,
				auth_sessions: schema.authSessions,
				auth_accounts: schema.authAccounts,
				auth_verifications: schema.authVerifications,
			},
		}),

		advanced: {
			database: {
				// Keeps users.id on its bigint sequence, so every existing foreign key
				// still resolves. Text ids would have meant re-keying every dependent
				// row - trivial at two users, a project at ten thousand.
				generateId: 'serial',
			},
			cookiePrefix: 'frugalist',
		},

		emailAndPassword: {
			enabled: true,
			// Laravel used Password::defaults(), which is min:8 by default.
			minPasswordLength: 8,
			maxPasswordLength: 4096,
			password: {
				async verify({ hash, password }) {
					if (looksLikeBcrypt(hash)) {
						// A password carried over from Laravel.
						return verifyBcrypt(password, hash);
					}
					// Already migrated to Better Auth's scrypt.
					const { verifyPassword } = await import('better-auth/crypto');
					return verifyPassword({ hash, password });
				},
			},
			/*
			 * Without this Better Auth refuses reset requests outright, and the compat
			 * route answered "link sent" regardless - so nobody could recover an
			 * account. The link goes straight to the web app's reset page, which posts
			 * the token back through /reset-password.
			 */
			async sendResetPassword({ user, token }) {
				const url = `${config.WEB_URL}/reset-password/${encodeURIComponent(token)}?email=${encodeURIComponent(user.email)}`;
				await deliver(user.email, passwordResetEmail(url), 'password reset');
			},
		},

		emailVerification: {
			// Laravel's MustVerifyEmail sent this on registration.
			sendOnSignUp: true,
			async sendVerificationEmail({ user, url }) {
				// `url` is Better Auth's verify endpoint, which redirects to the
				// callbackURL the request named once the token checks out.
				await deliver(user.email, verificationEmail(url), 'email verification');
			},
			/*
			 * Better Auth records verification in its own `email_verified` flag, but
			 * everything ported from Laravel - price-alert emails included - reads
			 * `email_verified_at`. Set both, or a verified user still gets no alerts.
			 */
			async afterEmailVerification(user) {
				await db()
					.update(schema.users)
					.set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
					.where(eq(schema.users.id, Number(user.id)));
			},
		},

		user: {
			modelName: 'users',
			// Mapped to the Drizzle property names, which are camelCase, not to the
			// underlying snake_case column names - the adapter resolves through the
			// schema object rather than going straight to SQL.
			fields: {
				emailVerified: 'emailVerified',
				image: 'avatarUrl',
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
			},
			// Columns the Laravel app owns. Declared so reads and writes round-trip
			// rather than being silently dropped.
			additionalFields: {
				firstName: { type: 'string', required: false, input: true, fieldName: 'firstName' },
				lastName: { type: 'string', required: false, input: true, fieldName: 'lastName' },
				username: { type: 'string', required: false, input: true, fieldName: 'username' },
				website: { type: 'string', required: false, input: true, fieldName: 'website' },
				phoneNumber: { type: 'string', required: false, input: true, fieldName: 'phoneNumber' },
				isAdmin: {
					type: 'boolean',
					required: false,
					input: false,
					defaultValue: false,
					fieldName: 'isAdmin',
				},
			},
		},

		session: {
			modelName: 'auth_sessions',
			expiresIn: 60 * 60 * 24 * 30,
			updateAge: 60 * 60 * 24,
		},

		account: { modelName: 'auth_accounts' },
		verification: { modelName: 'auth_verifications' },

		/*
		 * Origin checking.
		 *
		 * Better Auth rejects a request whose Origin it does not trust, which is
		 * correct for browsers but bites native clients: a React Native fetch sends
		 * no Origin at all, so mobile sign-in returns MISSING_OR_NULL_ORIGIN.
		 *
		 * The app's custom scheme is therefore trusted explicitly. It comes from
		 * app/env.js (SCHEME = 'thefrugalist'), and the Expo plugin below sets the
		 * matching Origin on native requests.
		 */
		// WEB_URL is where email-verification redirects land.
		trustedOrigins: [...new Set([...config.CORS_ORIGINS, config.WEB_URL, 'thefrugalist://'])],

		plugins: [
			// Surfaces the session token in the Set-Auth-Token response header and
			// accepts it back as Authorization: Bearer - what the Expo client stores
			// in expo-secure-store, since it has no cookie jar.
			bearer(),
			// Handles the native origin and deep-link callback shapes.
			expo(),
		],
	});
}

/**
 * sendMail reports failure in its result rather than throwing. Logged, not
 * thrown: the forgot-password response must not reveal whether an address
 * exists, so a failed send cannot change what the caller sees.
 */
async function deliver(
	to: string,
	mail: { subject: string; html: string; text: string },
	kind: string,
): Promise<void> {
	const result = await sendMail({ to, ...mail });
	if (!result.sent) logger().error({ error: result.error, kind }, 'account email failed to send');
}

let instance: ReturnType<typeof createAuth> | null = null;

export function auth() {
	return (instance ??= createAuth());
}

export function resetAuthForTesting(): void {
	instance = null;
}

export type Auth = ReturnType<typeof createAuth>;
export type AuthSession = Auth['$Infer']['Session'];
