import { z } from 'zod/v4';
import { command, getRequestEvent, query } from '$app/server';
import { authenticateUser } from '$lib/auth/queries.remote';
import { getDefaultCampaign } from '$lib/campaigns/queries.remote';
import { error } from '@sveltejs/kit';
import { logger } from '$lib/logging.server';

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
	try {
		return appsSvc.getApplication(defaultCampaign.id, applicationId);
	} catch (e) {
		const err = e as Error;
		logger.error({ error: err.message }, 'User unauthorised');

		return error(401, { message: 'Unauthorised' });
	}
});

export const deleteApplications = command(
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

export const deleteApplicationTask = command(
	z.object({
		applicationId: z.string(),
		taskId: z.string()
	}),
	async ({ applicationId, taskId }) => {
		await authenticateUser();
		const application = await getApplication(applicationId);

		const event = getRequestEvent();

		const { appsSvc } = event.locals;
		await appsSvc.deleteTask(application.id, taskId);
	}
);
