import { type Actions, redirect } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { extractFormFromRequest } from '$lib/forms';
import { logger } from '$lib/logging';

const formSchema = z.object({
	campaignId: z.string(),
	company: z.string(),
	position: z.string(),
	salary: z.string().optional().nullable(),
	url: z.string(),
	startDate: z.coerce.date()
});

export const actions = {
	default: async ({ locals, request }) => {
		try {
			const formData = await extractFormFromRequest(request, formSchema);
			await locals.appsSvc.createApplication(formData.campaignId, {
				...formData
			});
		} catch (e) {
			if (e instanceof z.ZodError) {
				return {
					error: z.prettifyError(e)
				};
			}

			const err = e as Error;
			logger.error({ error: err.message }, 'error submitting form');
			return {
				success: false,
				error: 'Something went wrong'
			};
		}

		redirect(301, '/applications');
	}
} satisfies Actions;
