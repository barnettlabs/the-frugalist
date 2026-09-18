import { describe, expect, it } from 'vitest';

import { renderPrompt } from './prompt.js';
import { validateAgainstSchema, type JsonSchema } from './schema-validator.js';

/**
 * The prompt renderer and output validator.
 *
 * Both operate on data stored in the database and edited through the admin UI -
 * prompt templates and JSON Schema documents - so their behaviour is a contract
 * with rows that already exist. A template that renders differently, or a schema
 * keyword that stops being honoured, silently changes what agents produce.
 */

describe('renderPrompt', () => {
	it('substitutes a simple placeholder', () => {
		expect(renderPrompt('Grade this: {{name}}', { name: 'Civic' })).toBe('Grade this: Civic');
	});

	it('tolerates whitespace inside the braces', () => {
		expect(renderPrompt('{{ name }}', { name: 'Civic' })).toBe('Civic');
	});

	it('resolves dotted paths', () => {
		expect(renderPrompt('{{context.inputs.msrp}}', { context: { inputs: { msrp: 42000 } } })).toBe(
			'42000',
		);
	});

	it('renders a missing path as empty rather than leaving the placeholder', () => {
		// Leaving "{{missing}}" in the prompt would send the literal token to the
		// model, which is worse than sending nothing.
		expect(renderPrompt('a{{missing}}b', {})).toBe('ab');
		expect(renderPrompt('a{{deeply.missing.path}}b', {})).toBe('ab');
	});

	it('renders null as empty', () => {
		expect(renderPrompt('[{{value}}]', { value: null })).toBe('[]');
	});

	it('renders objects and arrays as pretty JSON', () => {
		const out = renderPrompt('{{data}}', { data: { a: 1 } });

		expect(out).toContain('"a": 1');
		expect(out).toContain('\n');
	});

	it('leaves text with no placeholders untouched', () => {
		expect(renderPrompt('no placeholders here', {})).toBe('no placeholders here');
	});

	it('substitutes every occurrence, not just the first', () => {
		expect(renderPrompt('{{x}}-{{x}}', { x: 'a' })).toBe('a-a');
	});
});

describe('validateAgainstSchema', () => {
	it('accepts anything when no schema is set', () => {
		expect(validateAgainstSchema({ anything: true }, null)).toEqual([]);
	});

	it('checks types and reports the path', () => {
		const schema: JsonSchema = { type: 'object', properties: { grade: { type: 'string' } } };

		expect(validateAgainstSchema({ grade: 42 }, schema)).toEqual(['$.grade: expected string']);
	});

	it('reports missing required keys', () => {
		const schema: JsonSchema = { type: 'object', required: ['grade', 'summary'] };

		expect(validateAgainstSchema({ grade: 'A' }, schema)).toEqual([
			'$.summary: missing required',
		]);
	});

	it('enforces enums with the exact message the admin log shows', () => {
		const schema: JsonSchema = {
			type: 'object',
			properties: { grade: { type: 'string', enum: ['A', 'B', 'C'] } },
		};

		expect(validateAgainstSchema({ grade: 'F' }, schema)).toEqual([
			'$.grade: not in enum (A|B|C)',
		]);
	});

	it('enforces maxItems', () => {
		const schema: JsonSchema = { type: 'array', maxItems: 2 };

		expect(validateAgainstSchema([1, 2, 3], schema)).toEqual(['$: exceeds maxItems 2']);
	});

	it('validates array items and indexes the path', () => {
		const schema: JsonSchema = { type: 'array', items: { type: 'string' } };

		expect(validateAgainstSchema(['a', 2], schema)).toEqual(['$[1]: expected string']);
	});

	it('treats an empty array as satisfying object, as PHP did', () => {
		// PHP has one array type for lists and maps, and the original counted an
		// empty array as either. Agents returning [] passed before and still do.
		expect(validateAgainstSchema([], { type: 'object' })).toEqual([]);
	});

	it('distinguishes a list from a map', () => {
		expect(validateAgainstSchema({ a: 1 }, { type: 'array' })).toEqual(['$: expected array']);
		expect(validateAgainstSchema([1], { type: 'object' })).toEqual(['$: expected object']);
	});

	it('validates nested objects', () => {
		const schema: JsonSchema = {
			type: 'object',
			properties: {
				detail: { type: 'object', required: ['reason'], properties: { reason: { type: 'string' } } },
			},
		};

		expect(validateAgainstSchema({ detail: { reason: 7 } }, schema)).toEqual([
			'$.detail.reason: expected string',
		]);
		expect(validateAgainstSchema({ detail: {} }, schema)).toEqual([
			'$.detail.reason: missing required',
		]);
	});

	it('accepts an integer for number but not a float for integer', () => {
		expect(validateAgainstSchema(5, { type: 'number' })).toEqual([]);
		expect(validateAgainstSchema(5.5, { type: 'number' })).toEqual([]);
		expect(validateAgainstSchema(5, { type: 'integer' })).toEqual([]);
		expect(validateAgainstSchema(5.5, { type: 'integer' })).toEqual(['$: expected integer']);
	});

	it('collects several errors rather than stopping at the first', () => {
		const schema: JsonSchema = {
			type: 'object',
			required: ['a', 'b'],
			properties: { c: { type: 'string' } },
		};

		// The pipeline joins these with "; " into the retry instruction, so the
		// model is told about everything that was wrong at once.
		expect(validateAgainstSchema({ c: 1 }, schema)).toHaveLength(3);
	});
});
