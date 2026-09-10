import { pino, type Logger } from 'pino';

import { env } from '../config/env.js';

let instance: Logger | null = null;

export function logger(): Logger {
	if (instance) return instance;

	const config = env();
	const pretty = config.NODE_ENV === 'development';

	instance = pino({
		level: config.LOG_LEVEL,
		base: { env: config.APP_ENV },
		// Structured JSON in every deployed environment so logs stay queryable;
		// human-readable only on a developer's machine.
		...(pretty
			? { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } } }
			: {}),
		redact: {
			paths: [
				'req.headers.authorization',
				'req.headers.cookie',
				'*.password',
				'*.password_confirmation',
				'*.token',
				'*.plainTextToken',
			],
			censor: '[redacted]',
		},
	});

	return instance;
}

export function setLoggerForTesting(value: Logger | null): void {
	instance = value;
}
