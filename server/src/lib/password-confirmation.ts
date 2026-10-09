import { verify as verifyBcrypt } from '@node-rs/bcrypt';
import { and, eq } from 'drizzle-orm';

import { db } from '../db/client.js';
import { authAccounts } from '../db/schema.js';
import { HttpError } from '../http/errors.js';

/**
 * Re-confirms the signed-in user's password before a sensitive change.
 *
 * Laravel's `current_password` rule required it unconditionally. That cannot be
 * unconditional here: Better Auth supports social sign-in, and an account
 * created that way has no credential password to check. So the rule is "confirm
 * it if there is one" - strictly the same requirement for every account that
 * exists today, and correct rather than broken for a social account added later.
 *
 * Errors are reported on `field`, which is where each form displays them.
 */
export async function confirmPassword(
	userId: number,
	password: string | null | undefined,
	field: string,
): Promise<void> {
	const [credential] = await db()
		.select({ password: authAccounts.password })
		.from(authAccounts)
		.where(and(eq(authAccounts.userId, userId), eq(authAccounts.providerId, 'credential')))
		.limit(1);

	if (!credential?.password) return;

	if (!password) {
		throw HttpError.field(field, `The ${field.replace(/_/g, ' ')} field is required.`);
	}

	if (!(await verifyPassword(credential.password, password))) {
		throw HttpError.field(field, 'The provided password is incorrect.');
	}
}

async function verifyPassword(hash: string, password: string): Promise<boolean> {
	// A hash carried over from Laravel, or one Better Auth has since written.
	if (['$2a$', '$2b$', '$2y$'].some((p) => hash.startsWith(p))) {
		return verifyBcrypt(password, hash);
	}

	const { verifyPassword: verify } = await import('better-auth/crypto');
	return verify({ hash, password });
}
