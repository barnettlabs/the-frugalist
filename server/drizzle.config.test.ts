import { defineConfig } from 'drizzle-kit';

/**
 * The test database needs the same schema as development, but `pnpm test` will
 * not create it - a suite that silently ran against an unmigrated database
 * fails 41 tests with `relation does not exist`, which reads like a code fault
 * rather than a missing setup step. `pnpm db:migrate:test` applies migrations
 * to it, and this config exists so that command needs no shell plumbing.
 *
 * Defaults match src/test/setup.ts. Override with TEST_DATABASE_URL.
 */
export default defineConfig({
	dialect: 'postgresql',
	schema: './src/db/schema.ts',
	out: './drizzle',
	dbCredentials: {
		url:
			process.env.TEST_DATABASE_URL ??
			'postgres://frugalist:frugalist@127.0.0.1:55432/frugalist_test',
	},
});
