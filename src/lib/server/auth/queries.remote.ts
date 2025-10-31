import { getRequestEvent, query } from '$app/server';
import { AUTH_COOKIE_NAME } from '$lib/server/auth/types.server';
import { redirect } from '@sveltejs/kit';
import { logger } from '$lib/logging.server';

export const authenticateUser = query(async () => {
	const event = getRequestEvent();

	const authToken = event.cookies.get(AUTH_COOKIE_NAME);
	if (!authToken) {
		logger.debug('no auth token found, redirecting to login');

		return redirect(303, '/login');
	}

	try {
		event.locals.session = await event.locals.authSvc.verify(authToken);
	} catch (error) {
		const err = error as Error;
		logger.error({ error: err.message }, 'could not verify token');

		return redirect(303, '/login');
	}
});
