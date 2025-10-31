import { authenticateUser } from '$lib/auth/queries.remote';
import { getDefaultCampaign } from '$lib/campaigns/queries.remote';

export const load = async ({ locals }) => {
	await authenticateUser();

	const defaultCampaign = await getDefaultCampaign();

	const activeApps = await locals.appsSvc.getActiveApplications(defaultCampaign.id);

	return {
		applications: activeApps
	};
};
