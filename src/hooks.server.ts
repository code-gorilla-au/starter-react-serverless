import { type Handle, redirect } from '@sveltejs/kit';
import { applicationServiceFactory } from '$lib/applications/service.server';
import { sequence } from '@sveltejs/kit/hooks';
import { userServiceFactory } from '$lib/users/service.server';
import { AUTH_COOKIE_NAME, AuthService } from '$lib/auth';
import { campaignServiceFactory } from '$lib/campaigns/service.server';
import { authenticateUser } from '$lib/auth/queries.remote';
import { getDefaultCampaign } from '$lib/campaigns/queries.remote';

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
		return resolve(event);
	}

	if (event.route.id?.includes('(public)')) {
		return resolve(event);
	}

	const authToken = event.cookies.get(AUTH_COOKIE_NAME);
	if (!authToken) {
		return redirect(303, '/login');
	}

	await authenticateUser();
	await getDefaultCampaign();

	return resolve(event);
};

export const handle = sequence(attachLocalServices, resolveRoutePaths);
