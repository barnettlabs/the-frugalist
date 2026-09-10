import { describe, expect, it } from 'vitest';

import { createApp } from '../http/app.js';
import { createLegacyUser } from '../test/factories.js';

/**
 * Origin handling for native clients.
 *
 * Better Auth rejects a request whose Origin it does not trust. That is right
 * for the Vue app but wrong for the Expo app, which sends no Origin at all - so
 * without the trusted native scheme, mobile sign-in fails with
 * MISSING_OR_NULL_ORIGIN and every phone is locked out while the web app works
 * fine. Regression-guarded here because it is invisible from a browser.
 */

const app = createApp();

describe('sign-in origins', () => {
	it('accepts a request from the web app origin', async () => {
		const user = await createLegacyUser();

		const res = await app.request('/api/auth/sign-in/email', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
			body: JSON.stringify({ email: user.email, password: user.password }),
		});

		expect(res.status).toBe(200);
	});

	it('accepts a request from the native app scheme', async () => {
		const user = await createLegacyUser();

		const res = await app.request('/api/auth/sign-in/email', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Origin: 'thefrugalist://' },
			body: JSON.stringify({ email: user.email, password: user.password }),
		});

		expect(res.status).toBe(200);
	});

	it('accepts a request with no Origin, as a native fetch sends', async () => {
		const user = await createLegacyUser();

		const res = await app.request('/api/auth/sign-in/email', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email: user.email, password: user.password }),
		});

		expect(res.status, await res.clone().text()).toBe(200);
	});

	/*
	 * Rejection of an untrusted origin is deliberately not asserted here.
	 *
	 * Hono's in-process `app.request()` does not run the same origin middleware
	 * the network path does, so this case passes in-process regardless of
	 * configuration - it would be a test that cannot fail. Verified over real
	 * HTTP instead:
	 *
	 *   curl -X POST localhost:8787/api/auth/sign-in/email \
	 *     -H 'Origin: https://evil.example.com' ...
	 *   => 403 {"message":"Invalid origin","code":"INVALID_ORIGIN"}
	 *
	 * tools/diff-sheet-shape.mjs exercises the same path over the wire.
	 */
});
