import { z } from 'zod/v4';

/**
 * Defines the structure of the server environment configuration.
 * */
export const envServerSchema = z.object({
	appTableName: z.string().min(1),
	dynamoEndpoint: z.string().optional(),
	domain: z.string().min(1),
	logLevel: z.string().min(1),
	secretAppSigningToken: z.string().min(1)
});

/**
 * Represents the server environment configuration derived from a predefined schema.
 * The `EnvServer` type is inferred from the `envServerSchema` using Zod,
 * providing a structured and type-safe representation of environment variables or configuration.
 *
 * This type is typically used to validate and ensure the integrity of server-side
 * configuration settings, allowing the developer to catch potential issues
 * during development or runtime.
 */
export type EnvServer = z.infer<typeof envServerSchema>;

/**
 * Loads and validates the server environment variables into a structured object.
 *
 * This method extracts necessary environment variables, applies default values if needed,
 * and validates the resulting structure using a predefined schema.
 */
export function loadServerEnv(): EnvServer {
	const data: EnvServer = {
		appTableName: process.env.VITE_APP_TABLE_NAME ?? '',
		dynamoEndpoint: process.env.VITE_LOCAL_DYNAMODB_ENDPOINT ?? '',
		domain: process.env.VITE_DOMAIN ?? '',
		logLevel: process.env.VITE_LOG_LEVEL ?? '',
		secretAppSigningToken: process.env.VITE_SECRET_APP_SIGNING_TOKEN ?? ''
	};

	return envServerSchema.parse(data);
}
