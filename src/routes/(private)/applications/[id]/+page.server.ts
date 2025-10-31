import { type Actions, fail } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { extractFormFromRequest } from '$lib/forms';
import { logger } from '$lib/logging.server';
import { getDefaultCampaign } from '$lib/campaigns/queries.remote';
import { authenticateUser } from '$lib/auth/queries.remote';

export const load = async ({ params, locals }) => {
	const applicationId = params.id;

	const defaultCampaign = await getDefaultCampaign();

	const campaignId = defaultCampaign.id;

	const application = await locals.appsSvc.getApplication(campaignId, applicationId);

	return {
		application
	};
};

const addApplicationNoteSchema = z.object({
	note: z.string(),
	campaignId: z.string(),
	applicationId: z.string()
});

const addApplicationTaskSchema = z.object({
	name: z.string().min(1),
	dueDate: z.coerce.date().optional(),
	applicationId: z.string().min(1)
});

const addTaskNoteSchema = z.object({
	note: z.string(),
	taskId: z.string().min(1),
	applicationId: z.string().min(1)
});

export const actions = {
	/**
	 * Add a note to an application.
	 */
	addApplicationNote: async ({ locals, request }) => {
		try {
			const defaultCampaign = await getDefaultCampaign();

			const formData = await extractFormFromRequest(request, addApplicationNoteSchema);

			await locals.appsSvc.addNoteToApplication(
				defaultCampaign.id,
				formData.applicationId,
				formData.note
			);

			return {
				success: true
			};
		} catch (e) {
			const err = e as Error;
			logger.error({ error: err.message }, 'error adding note');

			if (e instanceof z.ZodError) {
				return fail(400, {
					error: z.prettifyError(e)
				});
			}

			return fail(500, { error: 'Something went wrong' });
		}
	},
	addApplicationTask: async ({ locals, request }) => {
		try {
			await authenticateUser();
			await getDefaultCampaign();

			const formData = await extractFormFromRequest(request, addApplicationTaskSchema);
			await locals.appsSvc.addTaskToApplication(formData.applicationId, {
				name: formData.name,
				dueDate: formData.dueDate,
				description: ''
			});

			return {
				success: true
			};
		} catch (e) {
			const err = e as Error;
			logger.error({ error: err.message }, 'could not add task to application');

			if (e instanceof z.ZodError) {
				return fail(400, { error: z.prettifyError(e) });
			}

			return fail(500, { error: 'Something went wrong' });
		}
	},
	addTaskNote: async ({ locals, request }) => {
		await authenticateUser();

		const formData = await extractFormFromRequest(request, addTaskNoteSchema);

		await locals.appsSvc.addTaskNote({
			applicationId: formData.applicationId,
			content: formData.note,
			taskId: formData.taskId
		});
	}
} satisfies Actions;
