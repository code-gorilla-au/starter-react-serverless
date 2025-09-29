import { expireAuthCookie } from '$lib/server/auth';

export const load = async ({ cookies }) => {
	expireAuthCookie(cookies);
};
