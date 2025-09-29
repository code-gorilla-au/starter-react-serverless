import { type Handle, redirect } from '@sveltejs/kit';
import { applicationServiceFactory } from '$lib/applications/service.server';
import { sequence } from '@sveltejs/kit/hooks';
import { userServiceFactory } from '$lib/users/service.server';
import { AUTH_COOKIE_NAME, AuthService } from '$lib/server/auth';
import { logger } from '$lib/logging';
import { campaignServiceFactory } from '$lib/campaigns/service.server';

const appsSvc = applicationServiceFactory();
const campaignSvc = campaignServiceFactory();
const userSvc = userServiceFactory();
const authSvc = new AuthService();

const attachLocalServices: Handle = ({ event, resolve }) => {
	event.locals.appsSvc = appsSvc;
	event.locals.campaignSvc = campaignSvc;
	event.locals.userSvc = userSvc;
	event.locals.authSvc = authSvc;

	return resolve(event);
};

export const resolveRoutePaths: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/' || event.url.pathname === '') {
		return redirect(303, '/campaigns');
	}

	if (event.route.id?.includes('(public)')) {
		return resolve(event);
	}

	const authToken = event.cookies.get(AUTH_COOKIE_NAME);
	if (!authToken) {
		return redirect(303, '/login');
	}

	try {
		event.locals.session = await event.locals.authSvc.verify(authToken);
		event.locals.defaultCampaign = await event.locals.campaignSvc.getDefaultCampaign(
			event.locals.session.userId
		);

		return resolve(event);
	} catch (error) {
		const err = error as Error;
		logger.error({ error: err.message }, 'could not verify token');

		return redirect(303, '/login');
	}
};

export const handle = sequence(attachLocalServices, resolveRoutePaths);
