export type FromParam = 'home' | 'tools' | 'finance' | 'lease' | 'watch';

const FROM_PARAM_VALUES: ReadonlySet<string> = new Set<FromParam>([
	'home',
	'tools',
	'finance',
	'lease',
	'watch',
]);

export function safeFromParam(value: string | undefined): FromParam | undefined {
	return value !== undefined && FROM_PARAM_VALUES.has(value)
		? (value as FromParam)
		: undefined;
}
