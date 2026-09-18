import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle owns the schema. Migrations in ./drizzle are the source of truth, with
 * 0000_baseline.sql being the full schema as it stood when Laravel was removed.
 *
 * src/db/schema.ts is still generated rather than authored: change the database
 * with a migration, then regenerate. `db:pull` runs tools/normalize-schema.mjs
 * afterwards because drizzle-kit emits four constructs Postgres or Node reject.
 *
 *   pnpm db:generate   create a migration from schema.ts changes
 *   pnpm db:migrate    apply migrations
 *   pnpm db:pull       regenerate src/db/schema.ts from the database
 */
export default defineConfig({
	dialect: 'postgresql',
	schema: './src/db/schema.ts',
	out: './drizzle',
	dbCredentials: {
		url: process.env.DATABASE_URL ??
			'postgres://frugalist:frugalist@127.0.0.1:55432/frugalist',
	},
	casing: 'snake_case',
	verbose: true,
	strict: true,
});
