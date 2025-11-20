import { type Actions, error, redirect } from '@sveltejs/kit';
import { authenticateUser } from '$lib/auth/queries.remote';
import { getDefaultCampaignOrRedirect } from '$lib/campaigns/queries.remote';

export const load = async ({ locals, params }) => {
	await authenticateUser();
	const defaultCampaign = await getDefaultCampaignOrRedirect();

	if (!params.id) {
		error(404, 'Application Not found');
	}

	const application = await locals.appsSvc.getApplication(defaultCampaign.id, params.id);

	return {
		application
	};
};

export const actions = {
	deleteApplication: async ({ params, locals }) => {
		await authenticateUser();
		const defaultCampaign = await getDefaultCampaignOrRedirect();

		if (!params.id) {
			error(404, 'Application Not found');
		}

		await locals.appsSvc.deleteApplication(defaultCampaign?.id, params.id);

		redirect(303, '/applications');
	}
} satisfies Actions;
