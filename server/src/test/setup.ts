import { loadEnv, setEnvForTesting } from '../config/env.js';

/**
 * Tests get an explicit config rather than whatever happens to be in the shell.
 * Nothing here touches the database unless a test asks for it.
 */
setEnvForTesting(
	loadEnv({
		NODE_ENV: 'test',
		APP_ENV: 'test',
		APP_URL: 'http://localhost:8787',
		PORT: '8787',
		LOG_LEVEL: 'silent' as never,
		DATABASE_URL:
			process.env.TEST_DATABASE_URL ?? 'postgres://jasonbarnett@127.0.0.1:5432/frugalist_test',
		REDIS_URL: process.env.TEST_REDIS_URL ?? 'redis://127.0.0.1:6379/1',
		CORS_ORIGINS: 'http://localhost:5173',
		SESSION_SECRET: 'test-secret-that-is-at-least-32-characters',
		MAIL_TRANSPORT: 'log',
	} as never),
);
