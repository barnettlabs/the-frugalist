/** Sizes shared by the input components and their wrappers. */
export type InputSize = 'sm' | 'md' | 'lg';

/** An option in a <select>-style input. */
export type SelectOption = {
	value: string | number;
	label: string;
};

/**
 * The shapes SelectInput accepts before normalising: a bare string, or an
 * object keyed by any of value/id and label/name/text.
 */
export type SelectOptionInput =
	| string
	| {
			value?: string | number;
			id?: string | number;
			label?: string;
			name?: string;
			text?: string;
			disabled?: boolean;
	  };
