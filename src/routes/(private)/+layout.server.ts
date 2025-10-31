import type { UserSession } from '$lib/auth';

export const load = async ({ locals }) => {
	const session = locals.session as UserSession;

	const campaigns = await locals.campaignSvc.getCampaignsForUser(session.userId);
	const defaultCampaign = await locals.campaignSvc.getDefaultCampaign(session.userId);
	locals.defaultCampaign = defaultCampaign;

	return {
		defaultCampaign: defaultCampaign,
		campaigns: campaigns,
		session: session
	};
};
