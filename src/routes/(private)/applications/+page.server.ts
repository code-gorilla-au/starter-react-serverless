import type { ApplicationDto } from '$lib/applications/types';

export const load = async ({ locals }) => {
	if (!locals.defaultCampaign) {
		return {
			applications: [] as ApplicationDto[]
		};
	}

	const activeApps = await locals.appsSvc.getActiveApplications(locals.defaultCampaign.id);

	return {
		applications: activeApps
	};
};
