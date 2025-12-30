import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export const shared = {
	plugins: [tailwindcss(), tsconfigPaths()],
	test: {
		setupFiles: ['vitest.setup.ts']
	}
};

export default defineConfig({
	...shared,
	plugins: [...shared.plugins, reactRouter()]
});
