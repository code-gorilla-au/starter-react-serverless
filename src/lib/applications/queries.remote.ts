import { z } from 'zod/v4';
import { applicationDtoSchema } from '$lib/applications/types';
import { getRequestEvent, query } from '$app/server';
import { authenticateUser } from '$lib/auth/queries.remote';

export const deleteApplications = query(
	z.object({
		campaignId: z.string(),
		applications: z.array(applicationDtoSchema)
	}),
	async ({ campaignId, applications }) => {
		await authenticateUser();

		const event = getRequestEvent();
		const { appsSvc } = event.locals;
		await appsSvc.bulkDeleteApplications(campaignId, applications);
	}
);

export const getCompleteApplications = query(z.string(), async (id) => {
	await authenticateUser();

	const event = getRequestEvent();
	const { appsSvc } = event.locals;
	return await appsSvc.getCompleteApplications(id);
});
