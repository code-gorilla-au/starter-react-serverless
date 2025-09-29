import { type Actions, error, redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
	if (!locals.session) {
		error(401, { message: 'unauthorized' });
	}

	if (!params.id) {
		error(404, 'Application Not found');
	}

	if (!locals.defaultCampaign) {
		error(404, 'Default Campaign not found');
	}

	const application = await locals.appsSvc.getApplication(locals.defaultCampaign.id, params.id);

	return {
		application
	};
};

export const actions = {
	deleteApplication: async ({ params, locals }) => {
		if (!locals.session) {
			error(404, 'Unauthorized');
		}

		if (!params.id) {
			error(404, 'Application Not found');
		}

		if (!locals.defaultCampaign) {
			error(404, 'Default Campaign not found');
		}

		await locals.appsSvc.deleteApplication(locals.defaultCampaign?.id, params.id);

		redirect(303, '/applications');
	}
} satisfies Actions;
