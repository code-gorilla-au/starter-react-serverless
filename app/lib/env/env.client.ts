import { z } from 'zod/v4';

const clientEnv = z.object({
	appName: z.string().min(1, 'App name is required'),
	logLevel: z.string().optional()
});

/**
 * Represents the client environment configuration derived from a predefined schema.
 */
export type ClientEnv = z.infer<typeof clientEnv>;

/**
 * Loads and validates the client environment variables into a structured object.
 */
export function loadClientEnv() {
	const env = {
		appName: import.meta.env.VITE_APP_NAME,
		logLevel: import.meta.env.VITE_LOG_LEVEL
	};

	return clientEnv.parse(env);
}
