import { getRequestEvent, query } from '$app/server';
import { AUTH_COOKIE_NAME } from '$lib/auth/types.server';
import { redirect } from '@sveltejs/kit';
import { logger } from '$lib/logging.server';

/**
 * A server-side function to authenticate the user based on a provided authentication token.
 * This function retrieves the authentication token from the request cookies and verifies it
 * to establish a user session.
 * In case the token is missing or invalid, the user is redirected to the login page.
 *
 * Functionality:
 * - Extracts the authentication token from the request cookies.
 * - Verifies the authentication token using the authentication service.
 * - Redirects users to the login page if the token is invalid or not found.
 * - Sets the verified session into the local event context for further use during the request lifecycle.
 *
 * Exceptions:
 * - Redirects with HTTP status 303 if the authentication token is missing or invalid.
 *
 * Side Effects:
 * - Updates the `event.locals.session` with the verified session if authentication is successful.
 */
export const authenticateUser = query(async () => {
	const event = getRequestEvent();

	const authToken = event.cookies.get(AUTH_COOKIE_NAME);
	if (!authToken) {
		logger.debug('no auth token found, redirecting to login');

		return redirect(303, '/login');
	}

	try {
		return await event.locals.authSvc.verify(authToken);
	} catch (error) {
		const err = error as Error;
		logger.error({ error: err.message }, 'could not verify token, redirecting');

		return redirect(303, '/login');
	}
});
