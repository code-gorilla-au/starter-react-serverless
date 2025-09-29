import { error, json, type RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.session) {
		error(401, { message: 'unauthorized' });
	}

	const applicationId = params.appId;
	if (!applicationId) {
		error(404, 'Application not found');
	}

	const campaignId = locals.defaultCampaign?.id;
	if (!campaignId) {
		error(404, { message: 'Campaign not found' });
	}

	await locals.appsSvc.deleteApplication(campaignId, applicationId);

	return json({ message: 'ok' });
};
