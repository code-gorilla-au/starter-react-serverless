import { z } from 'zod/v4';
import { getRequestEvent, query } from '$app/server';
import { authenticateUser } from '$lib/auth/queries.remote';
import { getDefaultCampaign } from '$lib/campaigns/queries.remote';

export const deleteApplications = query(
	z.object({
		campaignId: z.string(),
		applicationIds: z.array(z.string())
	}),
	async ({ campaignId, applicationIds }) => {
		await authenticateUser();

		const event = getRequestEvent();
		const { appsSvc } = event.locals;
		await appsSvc.bulkDeleteApplications(campaignId, applicationIds);
	}
);

export const getCompleteApplications = query(async () => {
	await authenticateUser();
	const defaultCampaign = await getDefaultCampaign();

	const event = getRequestEvent();
	const { appsSvc } = event.locals;
	return await appsSvc.getCompleteApplications(defaultCampaign.id);
});

export const getActiveApplications = query(async () => {
	await authenticateUser();
	const defaultCampaign = await getDefaultCampaign();

	const event = getRequestEvent();
	const { appsSvc } = event.locals;
	return await appsSvc.getActiveApplications(defaultCampaign.id);
});

export const getApplication = query(z.string(), async (applicationId) => {
	await authenticateUser();
	const defaultCampaign = await getDefaultCampaign();

	const event = getRequestEvent();
	const { appsSvc } = event.locals;
	return appsSvc.getApplication(defaultCampaign.id, applicationId);
});

export const deleteApplicationNote = query(
	z.object({ applicationId: z.string(), noteId: z.string() }),
	async ({ applicationId, noteId }) => {
		await authenticateUser();
		const defaultCampaign = await getDefaultCampaign();

		const event = getRequestEvent();
		const { appsSvc } = event.locals;
		return await appsSvc.deleteApplicationNote({
			applicationId,
			campaignId: defaultCampaign.id,
			noteId
		});
	}
);
