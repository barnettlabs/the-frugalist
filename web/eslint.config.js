import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import vueTsEslintConfig from '@vue/eslint-config-typescript';
import prettierConfig from '@vue/eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
	{
		name: 'app/files-to-lint',
		files: ['src/**/*.{ts,mts,tsx,vue}'],
	},
	{
		name: 'app/files-to-ignore',
		ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'public/**', '**/*.d.ts'],
	},
	js.configs.recommended,
	...pluginVue.configs['flat/recommended'],
	...vueTsEslintConfig(),
	prettierConfig,
	{
		plugins: {
			prettier: prettierPlugin,
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports,
		},
		rules: {
			'prettier/prettier': 'warn',
			'simple-import-sort/imports': 'warn',
			'simple-import-sort/exports': 'warn',
			'unused-imports/no-unused-imports': 'warn',
			'unused-imports/no-unused-vars': [
				'warn',
				{ vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
			],
			'vue/multi-word-component-names': 'off',
			'vue/no-v-html': 'off',
			'vue/block-lang': 'off',
			'vue/no-mutating-props': 'warn',
			'vue/require-default-prop': 'off',
			'vue/require-prop-types': 'warn',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
		},
	},
];
