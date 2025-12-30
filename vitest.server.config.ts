import { defineConfig } from 'vitest/config';

import { shared } from './vite.config';

const exclude = ['app/**/*.client*.{ts,tsx}', 'app/components/**/*.{ts,tsx}', '**/node_modules/**'];

export default defineConfig({
	...shared,
	test: {
		...shared.test,
		exclude,
		coverage: { exclude }
	}
});
