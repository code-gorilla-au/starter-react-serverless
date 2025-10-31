import { z } from 'zod/v4';
import { type Actions, redirect } from '@sveltejs/kit';
import { logger } from '$lib/logging.server';
import { extractFormFromRequest } from '$lib/forms';
import { authenticateUser } from '$lib/auth/queries.remote';

const formSchema = z.object({
	name: z.string(),
	description: z.string(),
	startDate: z.coerce.date()
});

export const actions = {
	default: async ({ locals, request }) => {
		const session = await authenticateUser();
		const user = await locals.userSvc.getActiveUser(session.email);

		try {
			const formData = await extractFormFromRequest(request, formSchema);

			await locals.campaignSvc.createCampaign(user.id, {
				...formData,
				isDefault: true
			});
		} catch (e) {
			if (e instanceof z.ZodError) {
				return {
					error: z.prettifyError(e)
				};
			}

			const err = e as Error;
			logger.error({ error: err.message }, 'could not create campaign');
			return {
				success: false,
				error: 'Something went wrong'
			};
		}

		redirect(301, '/applications');
	}
} satisfies Actions;
