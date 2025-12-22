import { z } from 'zod/v4';

export const userSessionSchema = z.object({
	name: z.string(),
	roles: z.array(z.string()),
	email: z.string(),
	userId: z.string()
});

export const AUTH_COOKIE_NAME = '--delightable-auth';
export type UserSession = z.infer<typeof userSessionSchema>;
export type SessionFlashData = {
	error: string;
};
