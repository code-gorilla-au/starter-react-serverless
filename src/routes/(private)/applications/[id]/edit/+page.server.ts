import { type Actions, error, fail, redirect } from '@sveltejs/kit';
import { extractFormFromRequest } from '$lib/forms';
import { prettifyError, ZodError, z } from 'zod/v4';
import { logger } from '$lib/logging';
import { applicationDtoStatus } from '$lib/applications/types';

export const load = async ({ locals, params }) => {
	if (!locals.defaultCampaign) {
		error(404, { message: 'No default campaign found' });
	}

	const campaignId = locals.defaultCampaign.id;

	const application = await locals.appsSvc.getApplication(campaignId, params.id);

	return {
		application
	};
};

const formSchema = z.object({
	id: z.string().min(1),
	company: z.string().min(1),
	position: z.string().min(1),
	status: applicationDtoStatus,
	salary: z.string().optional().nullable(),
	url: z.string(),
	startDate: z.coerce.date()
});

export const actions = {
	/**
	 * Updates an application within a default campaign context.
	 *
	 * This function retrieves the form data from the request and validates it against
	 * the application DTO schema. If validation passes, the application data is updated
	 * using the application's service. If the default campaign does not exist, the
	 * function fails with a 404 status.
	 *
	 * In case of a validation error (ZodError), a prettified error object is returned.
	 * Other runtime errors are logged, and the application is redirected to a specific
	 * application page upon successful completion.
	 */
	updateApplication: async ({ locals, request, params }) => {
		if (!locals.defaultCampaign) {
			fail(404, { message: 'No default campaign found' });
			return;
		}

		try {
			const formData = await extractFormFromRequest(request, formSchema);

			await locals.appsSvc.updateApplication(locals.defaultCampaign.id, {
				...formData,
				notes: []
			});
		} catch (e) {
			if (e instanceof ZodError) {
				return {
					error: prettifyError(e)
				};
			}

			const err = e as Error;
			logger.error({ error: err.message }, 'could not update application');

			return {
				error: err.message
			};
		}

		redirect(301, `/applications/${params.id}`);
	}
} satisfies Actions;
