import { z } from 'zod/v4';

export const severEnvVars = z.object({
	appTable: z.string(),
	dynamodbEndpoint: z.string().optional(),
	domain: z.string().optional(),
	logLevel: z.string().default('info')
});

export type ServerEnvVars = z.infer<typeof severEnvVars>;

export function loadServerEnv(): ServerEnvVars {
	return severEnvVars.parse({
		appTable: import.meta.env.VITE_APP_TABLE_NAME,
		dynamodbEndpoint: import.meta.env.VITE_LOCAL_DYNAMODB_ENDPOINT,
		domain: import.meta.env.VITE_DOMAIN,
		logLevel: import.meta.env.VITE_LOG_LEVEL
	});
}
