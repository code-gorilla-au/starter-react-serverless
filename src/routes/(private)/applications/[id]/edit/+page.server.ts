import { type Actions, fail, redirect } from '@sveltejs/kit';
import { extractFormFromRequest } from '$lib/forms';
import { prettifyError, ZodError, z } from 'zod/v4';
import { logger } from '$lib/logging.server';
import { applicationDtoStatus } from '$lib/applications/types';
import { getDefaultCampaign } from '$lib/campaigns/queries.remote';
import { authenticateUser } from '$lib/auth/queries.remote';
import { getApplication } from '$lib/applications/queries.remote';

export const load = async ({ params }) => {
	await authenticateUser();
	await getDefaultCampaign();

	const application = await getApplication(params.id);

	return {
		application
	};
};

const updateApplicationFormSchema = z.object({
	id: z.string().min(1),
	company: z.string().min(1),
	position: z.string().min(1),
	status: applicationDtoStatus,
	salary: z.string().optional().nullable(),
	url: z.string(),
	startDate: z.coerce.date()
});

const updateApplicationNoteSchema = z.object({
	noteId: z.string().min(1),
	content: z.string()
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
		await authenticateUser();
		const defaultCampaign = await getDefaultCampaign();

		if (!params.id) {
			return fail(400, { message: 'Application id is required' });
		}

		try {
			const formData = await extractFormFromRequest(request, updateApplicationFormSchema);

			await locals.appsSvc.updateApplication(defaultCampaign.id, {
				...formData,
				notes: []
			});
		} catch (e) {
			const err = e as Error;
			logger.error({ error: err.message }, 'could not update application');

			if (e instanceof ZodError) {
				return fail(400, {
					error: prettifyError(e)
				});
			}

			return fail(400, {
				error: err.message
			});
		}

		redirect(301, `/applications/${params.id}`);
	},
	updateApplicationNote: async ({ locals, request, params }) => {
		await authenticateUser();
		const defaultCampaign = await getDefaultCampaign();

		if (!params.id) {
			return fail(400, { message: 'Application id is required' });
		}

		try {
			const formData = await extractFormFromRequest(request, updateApplicationNoteSchema);
			await locals.appsSvc.updateApplicationNote({
				campaignId: defaultCampaign.id,
				applicationId: params.id,
				noteId: formData.noteId,
				content: formData.content
			});
		} catch (e) {
			const err = e as Error;
			logger.error({ error: err.message }, 'error updating application note');

			if (e instanceof ZodError) {
				return fail(400, {
					error: prettifyError(e)
				});
			}

			return fail(400, {
				error: err.message
			});
		}
	}
} satisfies Actions;
