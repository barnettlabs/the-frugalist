const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./components/**/*.{js,vue,ts}',
		'./layouts/**/*.vue',
		'./pages/**/*.vue',
		'./plugins/**/*.{js,ts}',
		'./app.vue',
		'./error.vue',
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Rubik', 'Inter var', ...defaultTheme.fontFamily.sans],
			},
			colors: {
				'primary': 'var(--color-primary)',
				'primary-shade-1': 'var(--color-primary-shade-1)',
				'primary-shade-2': 'var(--color-primary-shade-2)',
				'primary-shade-3': 'var(--color-primary-shade-3)',
				'primary-shade-4': 'var(--color-primary-shade-4)',
				'primary-shade-5': 'var(--color-primary-shade-5)',
				'primary-shade-6': 'var(--color-primary-shade-6)',
				'primary-tint-1': 'var(--color-primary-tint-1)',
				'primary-tint-2': 'var(--color-primary-tint-2)',
				'primary-tint-3': 'var(--color-primary-tint-3)',
				'primary-tint-4': 'var(--color-primary-tint-4)',
				'primary-tint-5': 'var(--color-primary-tint-5)',
				'primary-tint-6': 'var(--color-primary-tint-6)',
				'secondary': 'var(--color-secondary)',
				'success': 'var(--color-success)',
				'info': 'var(--color-info)',
				'warning': 'var(--color-warning)',
				'danger': 'var(--color-danger)',
				'light': 'var(--color-light)',
				'dark': 'var(--color-dark)',
			},
		},
	},

	plugins: [require('@tailwindcss/forms')],

	safelist: [
		{
			pattern: /bg-(primary|secondary|success|info|warning|danger|light|dark)/,
			variants: ['hover', 'focus', 'active'],
		},
		{
			pattern: /rounded-(.*)/,
		},
	],
}
