import { getRequestEvent, query } from '$app/server';
import { authenticateUser } from '$lib/auth/queries.remote';
import { redirect } from '@sveltejs/kit';

export const getDefaultCampaign = query(async () => {
	const event = getRequestEvent();

	const session = await authenticateUser();

	return await event.locals.campaignSvc.getDefaultCampaign(session.userId);
});

export const getDefaultCampaignOrRedirect = query(async () => {
	const campaign = await getDefaultCampaign();

	if (!campaign) {
		return redirect(303, '/campaigns/create');
	}

	return campaign;
});
