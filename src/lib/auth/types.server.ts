import type { JWTPayload } from 'jose';

export type UserSession = JWTPayload & {
	userId: string;
	email: string;
	name: string;
};

export const AUTH_COOKIE_NAME = '--auth-session';
