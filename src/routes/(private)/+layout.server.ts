import { authenticateUser } from '$lib/auth/queries.remote';
import { getDefaultCampaign } from '$lib/campaigns/queries.remote';

export const load = async ({ locals }) => {
	const session = await authenticateUser();
	const defaultCampaign = await getDefaultCampaign();

	const campaigns = await locals.campaignSvc.getCampaignsForUser(session.userId);

	return {
		defaultCampaign: defaultCampaign,
		campaigns: campaigns,
		session: session
	};
};
