import { z } from 'zod/v4';
import { type Actions, redirect } from '@sveltejs/kit';
import type { UserSession } from '$lib/server/auth';
import { logger } from '$lib/logging.server';
import { extractFormFromRequest } from '$lib/forms';

const formSchema = z.object({
	name: z.string(),
	description: z.string(),
	startDate: z.coerce.date()
});

export const actions = {
	default: async ({ locals, request }) => {
		const session = locals.session as UserSession;
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
