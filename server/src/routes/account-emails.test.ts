import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import type { MailMessage } from '../services/notifications/mail.js';
import { createLegacyUser } from '../test/factories.js';

/**
 * Password reset and email verification, end to end.
 *
 * Both used to be silently dead: no sender was configured, so Better Auth
 * refused the request and /forgot-password answered "link sent" anyway. These
 * capture the email that goes out and follow its link, the way a user would.
 */

const sent: MailMessage[] = [];

vi.mock('../services/notifications/mail.js', async () => {
	const actual = await vi.importActual<typeof import('../services/notifications/mail.js')>(
		'../services/notifications/mail.js',
	);

	return {
		...actual,
		sendMail: async (message: MailMessage) => {
			sent.push(message);
			return { sent: true, transport: 'test' };
		},
	};
});

const { createApp } = await import('../http/app.js');
const { auth } = await import('../lib/auth.js');
const app = createApp();

const post = (path: string, body: unknown) =>
	app.request(path, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});

const mailTo = (address: string) => sent.filter((m) => m.to === address);
const linkIn = (message: MailMessage) => message.text!.match(/https?:\/\/\S+/)![0];

beforeEach(() => {
	sent.length = 0;
});

describe('password reset', () => {
	it('emails a link to the web reset page that resets the password', async () => {
		const user = await createLegacyUser();

		const res = await post('/forgot-password', { email: user.email });
		expect(res.status).toBe(200);

		const [mail] = mailTo(user.email);
		expect(mail?.subject).toBe('Reset your TheFrugalist password');

		// Straight to the SPA's /reset-password/:token route, not the API host.
		const link = new URL(linkIn(mail!));
		expect(link.origin).toBe('http://localhost:5173');
		const token = decodeURIComponent(link.pathname.replace('/reset-password/', ''));

		const reset = await post('/reset-password', {
			token,
			email: user.email,
			password: 'a-brand-new-password',
			password_confirmation: 'a-brand-new-password',
		});
		expect(reset.status, await reset.clone().text()).toBe(200);

		const login = await post('/login', { email: user.email, password: 'a-brand-new-password' });
		expect(login.status).toBe(200);
	});

	it('sends nothing, and answers the same, for an unknown address', async () => {
		const res = await post('/forgot-password', { email: 'nobody-here@example.com' });

		expect(res.status).toBe(200);
		expect(sent).toHaveLength(0);
	});
});

describe('email verification', () => {
	it('emails a link on sign-up that verifies the address', async () => {
		const email = `verify-${Math.random().toString(36).slice(2, 10)}@example.com`;

		const res = await post('/register', {
			first_name: 'New',
			last_name: 'User',
			email,
			password: 'a-good-password',
			password_confirmation: 'a-good-password',
		});
		expect(res.status).toBe(201);

		const [mail] = mailTo(email);
		expect(mail?.subject).toBe('Verify your TheFrugalist email address');

		// The link is the API's verify endpoint, which redirects to the web app.
		const link = new URL(linkIn(mail!));
		const visit = await app.request(link.pathname + link.search);
		expect(visit.status).toBe(302);
		expect(visit.headers.get('location')).toBe('http://localhost:5173/dashboard?verified=1');

		// email_verified_at is what the price alerts check, not Better Auth's flag.
		const [row] = await db()
			.select({ verifiedAt: users.emailVerifiedAt, verified: users.emailVerified })
			.from(users)
			.where(eq(users.email, email));
		expect(row!.verified).toBe(true);
		expect(row!.verifiedAt).not.toBeNull();
	});

	it('sends a sign-up that names no callback to the web app too', async () => {
		// The seed's sign-up (and a direct /auth/sign-up/email) names no
		// callbackURL, and Better Auth fills in "/" - the API host's root, a 404.
		const email = `seeded-${Math.random().toString(36).slice(2, 10)}@example.com`;

		await auth().api.signUpEmail({
			body: { email, password: 'a-good-password', name: 'Seeded User' },
		});

		const [mail] = mailTo(email);
		const link = new URL(linkIn(mail!));
		const visit = await app.request(link.pathname + link.search);
		expect(visit.status).toBe(302);
		expect(visit.headers.get('location')).toBe('http://localhost:5173/dashboard?verified=1');
	});
});
