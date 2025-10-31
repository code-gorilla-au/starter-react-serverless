import type { ApplicationDto } from '$lib/applications/types';
import { authenticateUser } from '$lib/auth/queries.remote';

export const load = async ({ locals }) => {
	await authenticateUser();

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
