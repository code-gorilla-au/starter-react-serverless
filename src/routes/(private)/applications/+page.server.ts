import { authenticateUser } from '$lib/auth/queries.remote';
import { getActiveApplications, getCompleteApplications } from '$lib/applications/queries.remote';

export const load = async () => {
	await authenticateUser();

	const activeApps = await getActiveApplications();
	const completeApps = await getCompleteApplications();

	return {
		applications: activeApps,
		completeApplications: completeApps
	};
};
