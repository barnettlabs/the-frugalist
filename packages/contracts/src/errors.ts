import { z } from 'zod';

/**
 * The API error envelope.
 *
 * This shape is not a design choice we are free to make - it is Laravel's
 * validation response, and both clients already parse it:
 * `web/src/api/client.ts` and `app/src/api/common/client.tsx` both read
 * `error.response.data.errors` as a field -> string[] map and surface the first
 * message per field. Changing the shape would break every form in the web app
 * and the mobile app at the same time, so the Hono service reproduces it
 * exactly.
 *
 *     HTTP 422
 *     {
 *       "message": "The given data was invalid.",
 *       "errors": { "email": ["The email field is required."] }
 *     }
 *
 * Zod's native error output is nothing like this, so `zodToValidationErrors`
 * below does the translation in one place rather than at each call site.
 */

export const validationErrorSchema = z.object({
	message: z.string(),
	errors: z.record(z.string(), z.array(z.string())),
});

export type ValidationErrorBody = z.infer<typeof validationErrorSchema>;

export const apiErrorSchema = z.object({
	message: z.string(),
	errors: z.record(z.string(), z.array(z.string())).optional(),
});

export type ApiErrorBody = z.infer<typeof apiErrorSchema>;

export const DEFAULT_VALIDATION_MESSAGE = 'The given data was invalid.';

/**
 * Laravel renders `:attribute` by replacing underscores with spaces, so
 * `sales_tax_percent` becomes "sales tax percent". Verified against the running
 * Laravel app rather than assumed - this text is user-visible wherever a form
 * has no field-level binding for the error.
 */
export function humanizeField(field: string): string {
	return field.replace(/_/g, ' ').replace(/\./g, ' ');
}

/**
 * Laravel's top-level `message` for a validation failure is not a constant. It
 * is the first error, with a count of the rest appended:
 *
 *     one error   -> "The msrp field must be a number."
 *     three       -> "The msrp field must be a number. (and 2 more errors)"
 *
 * Both clients fall back to `message` when `errors` is absent or when a field
 * has no matching form control, so this string is shown to users and is
 * reproduced exactly rather than replaced with a generic sentence.
 */
export function summaryMessage(errors: Record<string, string[]>): string {
	const flat = Object.values(errors).flat();

	if (flat.length === 0) return DEFAULT_VALIDATION_MESSAGE;

	const [first] = flat;
	const remaining = flat.length - 1;

	if (remaining === 0) return first!;

	return `${first} (and ${remaining} more ${remaining === 1 ? 'error' : 'errors'})`;
}

/**
 * Flatten a Zod issue list into Laravel's field -> messages map.
 *
 * Laravel keys nested fields with dots (`address.line1`) and array members with
 * dots too (`items.0.name`); Zod gives a path array. Joining on "." reproduces
 * Laravel's convention, which is what the clients expect when they look up an
 * error for a nested form field.
 */
export function zodToValidationErrors(issues: z.ZodIssue[]): Record<string, string[]> {
	const errors: Record<string, string[]> = {};

	for (const issue of issues) {
		const key = issue.path.length > 0 ? issue.path.join('.') : '_';
		const bucket = errors[key] ?? (errors[key] = []);
		if (!bucket.includes(issue.message)) {
			bucket.push(issue.message);
		}
	}

	return errors;
}

export function validationErrorBody(
	errors: Record<string, string[]>,
	message?: string,
): ValidationErrorBody {
	return { message: message ?? summaryMessage(errors), errors };
}

/**
 * Thrown by handlers and route middleware; the app's error handler turns it
 * into a response. Carrying the status on the error keeps handlers free of
 * response-shaping code.
 */
export class HttpError extends Error {
	readonly status: number;
	readonly errors?: Record<string, string[]>;

	constructor(status: number, message: string, errors?: Record<string, string[]>) {
		super(message);
		this.name = 'HttpError';
		this.status = status;
		this.errors = errors;
	}

	static validation(errors: Record<string, string[]>, message?: string) {
		return new HttpError(422, message ?? summaryMessage(errors), errors);
	}

	/** A single-field 422, for checks Zod cannot express (uniqueness, current password). */
	static field(field: string, message: string) {
		const errors = { [field]: [message] };
		return new HttpError(422, summaryMessage(errors), errors);
	}

	static unauthenticated(message = 'Unauthenticated.') {
		return new HttpError(401, message);
	}

	static forbidden(message = 'This action is unauthorized.') {
		return new HttpError(403, message);
	}

	static notFound(message = 'Not found.') {
		return new HttpError(404, message);
	}

	static tooManyRequests(message = 'Too Many Attempts.') {
		return new HttpError(429, message);
	}

	toBody(): ApiErrorBody {
		return this.errors ? { message: this.message, errors: this.errors } : { message: this.message };
	}
}
