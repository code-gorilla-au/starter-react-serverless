import { expireAuthCookie } from '$lib/auth';

export const load = async ({ cookies }) => {
	expireAuthCookie(cookies);
};
