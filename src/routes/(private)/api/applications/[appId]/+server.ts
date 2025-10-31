import { error, json, type RequestHandler } from '@sveltejs/kit';
import { authenticateUser } from '$lib/auth/queries.remote';
import { getDefaultCampaign } from '$lib/campaigns/queries.remote';

export const DELETE: RequestHandler = async ({ locals, params }) => {
	await authenticateUser();
	const defaultCampaign = await getDefaultCampaign();

	const applicationId = params.appId;
	if (!applicationId) {
		error(404, 'Application not found');
	}

	const campaignId = defaultCampaign?.id;
	if (!campaignId) {
		error(404, { message: 'Campaign not found' });
	}

	await locals.appsSvc.deleteApplication(campaignId, applicationId);

	return json({ message: 'ok' });
};
