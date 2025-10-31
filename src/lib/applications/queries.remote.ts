import { z } from 'zod/v4';
import { applicationDtoSchema } from '$lib/applications/types';
import { getRequestEvent, query } from '$app/server';

export const deleteApplications = query(
	z.object({
		campaignId: z.string(),
		applications: z.array(applicationDtoSchema)
	}),
	async ({ campaignId, applications }) => {
		const event = getRequestEvent();
		const { appsSvc } = event.locals;
		await appsSvc.bulkDeleteApplications(campaignId, applications);
	}
);

export const getCompleteApplications = query(z.string(), async (id) => {
	const event = getRequestEvent();
	const { appsSvc } = event.locals;
	return await appsSvc.getCompleteApplications(id);
});
