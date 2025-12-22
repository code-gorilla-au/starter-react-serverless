import { z } from 'zod/v4';

export const userSessionSchema = z.object({
	name: z.string(),
	roles: z.array(z.string()),
	email: z.string()
});

export type UserSession = z.infer<typeof userSessionSchema>;
