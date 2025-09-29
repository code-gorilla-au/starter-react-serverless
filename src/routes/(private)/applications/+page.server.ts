import type { ApplicationDto } from '$lib/applications/types';

export const load = async ({ locals }) => {
	if (!locals.defaultCampaign) {
		return {
			applications: [] as ApplicationDto[]
		};
	}

	const applications = await locals.appsSvc.getApplications(locals.defaultCampaign.id);

	return {
		applications: applications
	};
};
