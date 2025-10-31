import { getRequestEvent, query } from '$app/server';
import { authenticateUser } from '$lib/auth/queries.remote';

export const getDefaultCampaign = query(async () => {
	await authenticateUser();

	const event = getRequestEvent();

	if (!event.locals.session) {
		return;
	}

	event.locals.defaultCampaign = await event.locals.campaignSvc.getDefaultCampaign(
		event.locals.session.userId
	);
});
