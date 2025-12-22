import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{
		ignores: ['.react-router/', 'build/', ".sst", ".dynamodb"]
	},
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		plugins: { js },
		extends: ['js/recommended'],
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
	},
	tseslint.configs.recommended,
	{
		files: ['sst.config.ts'],
		rules: {
			'@typescript-eslint/triple-slash-reference': 'off'
		}
	},
	pluginReact.configs.flat.recommended,
	pluginReact.configs.flat['jsx-runtime'],
	eslintConfigPrettier
]);
