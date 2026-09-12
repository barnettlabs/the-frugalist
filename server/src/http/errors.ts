import { HttpError, validationErrorBody, zodToValidationErrors } from '@frugalist/contracts';
import type { Context, ErrorHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

import { isProduction } from '../config/env.js';
import { captureError } from '../observability/sentry.js';

/**
 * Single place where a thrown error becomes a response body.
 *
 * The response shape is fixed by the clients, not by us. Both
 * web/src/api/client.ts and app/src/api/common/client.tsx read
 * `error.response.data.errors` as a field -> string[] map, so a 422 has to look
 * exactly like Laravel's:
 *
 *     { "message": "The given data was invalid.",
 *       "errors": { "email": ["The email field is required."] } }
 *
 * Anything else breaks every form in both apps simultaneously, which is why
 * this is centralised and covered by tests rather than shaped per-handler.
 */

export const errorHandler: ErrorHandler = (err, c) => {
	if (err instanceof HttpError) {
		return c.json(err.toBody(), err.status as 400);
	}

	// A Zod failure that escaped the validator middleware.
	if (err instanceof ZodError) {
		return c.json(validationErrorBody(zodToValidationErrors(err.issues)), 422);
	}

	if (err instanceof HTTPException) {
		return c.json({ message: err.message || 'Request failed.' }, err.status);
	}

	/*
	 * Anything unrecognised is a bug: log it, report it, and tell the client
	 * nothing about internals.
	 *
	 * Note what is *not* reported - HttpError, ZodError and HTTPException all
	 * return above. A 422 from a form or a 404 from a bad id is not a defect, and
	 * reporting them would bury the real failures under routine traffic.
	 */
	c.get('logger')?.error({ err }, 'unhandled error');

	captureError(err, {
		requestId: c.get('requestId'),
		userId: c.get('user')?.id,
		path: c.req.path,
		method: c.req.method,
	});

	return c.json(
		{
			message: 'Server Error',
			...(isProduction() ? {} : { detail: err instanceof Error ? err.message : String(err) }),
		},
		500,
	);
};

export const notFoundHandler: NotFoundHandler = (c) =>
	c.json({ message: `The route ${c.req.method} ${c.req.path} could not be found.` }, 404);

/**
 * Laravel returned 401 with this body for an unauthenticated API request, and
 * both clients key their "log the user out and redirect" behaviour off it.
 */
export function unauthenticated(c: Context) {
	return c.json({ message: 'Unauthenticated.' }, 401);
}

export { HttpError };
