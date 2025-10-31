import { getRequestEvent, query } from '$app/server';
import { authenticateUser } from '$lib/auth/queries.remote';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export const getDefaultCampaign = query(async () => {
	const session = await authenticateUser();

	const event = getRequestEvent();

	const campaign = await event.locals.campaignSvc.getDefaultCampaign(session.userId);

	if (!campaign) {
		redirect(303, resolve('/campaigns/create'));
	}

	return campaign;
});
