import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

import { shared } from './vite.config';

const exclude = [
	'app/**/*.server.*.{ts,tsx}',
	'**/node_modules/**',
	'app/components/ui/**/*.{ts,tsx}'
];

export default defineConfig({
	...shared,
	plugins: [...shared.plugins],
	test: {
		exclude,
		setupFiles: ['vitest.setup.ts'],
		browser: {
			headless: true,
			enabled: true,
			provider: playwright(),
			// https://vitest.dev/config/browser/playwright
			instances: [{ browser: 'chromium' }]
		},
		coverage: {
			include: ['app/**/*.{jsx}'],
			exclude
		}
	}
});
