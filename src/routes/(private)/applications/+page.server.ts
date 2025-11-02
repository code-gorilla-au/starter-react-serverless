import { authenticateUser } from '$lib/auth/queries.remote';
import { getActiveApplications } from '$lib/applications/queries.remote';

export const load = async () => {
	await authenticateUser();

	const activeApps = await getActiveApplications();

	return {
		applications: activeApps
	};
};
