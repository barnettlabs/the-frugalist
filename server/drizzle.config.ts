import { defineConfig } from 'drizzle-kit';

/**
 * The schema is introspected from the live database rather than authored here.
 *
 * Laravel owns the schema for the whole strangler-fig period - both services
 * run against one database, and Laravel keeps migrating it until Phase 6. Two
 * migration tools writing to the same schema would be a genuine hazard, so
 * Drizzle reads and does not write until the cutover is complete.
 *
 *   pnpm db:pull   regenerate src/db/schema.ts from the database
 */
export default defineConfig({
	dialect: 'postgresql',
	schema: './src/db/schema.ts',
	out: './drizzle',
	dbCredentials: {
		url: process.env.DATABASE_URL ?? 'postgres://jasonbarnett@127.0.0.1:5432/frugalist',
	},
	casing: 'snake_case',
	verbose: true,
	strict: true,
});
