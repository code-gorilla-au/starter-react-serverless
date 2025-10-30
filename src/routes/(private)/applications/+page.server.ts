import type { ApplicationDto } from '$lib/applications/types';

export const load = async ({ locals }) => {
	if (!locals.defaultCampaign) {
		return {
			applications: [] as ApplicationDto[],
			completeApps: [] as ApplicationDto[]
		};
	}

	const activeApps = await locals.appsSvc.getActiveApplications(locals.defaultCampaign.id);
	const completeApps = await locals.appsSvc.getCompleteApplications(locals.defaultCampaign.id);

	return {
		applications: activeApps,
		completeApps: completeApps
	};
};
