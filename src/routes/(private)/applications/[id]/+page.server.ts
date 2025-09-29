import { type Actions, error, fail } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { extractFormFromRequest } from '$lib/forms';
import { logger } from '$lib/logging';

export const load = async ({ params, locals }) => {
	const applicationId = params.id;

	if (!locals?.defaultCampaign) {
		error(404, 'Default Campaign is required to load applications');
	}

	const campaignId = locals?.defaultCampaign?.id;

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
	name: z.string(),
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
			if (!locals.session) {
				return fail(401, { error: 'Unauthorized' });
			}

			if (!locals.defaultCampaign) {
				return fail(404, { error: 'Default Campaign not found' });
			}

			const formData = await extractFormFromRequest(request, addApplicationNoteSchema);

			await locals.appsSvc.addNoteToApplication(
				locals.defaultCampaign.id as string,
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
			if (!locals.session) {
				return fail(401, { error: 'Unauthorized' });
			}

			if (!locals.defaultCampaign) {
				return fail(404, { error: 'Default Campaign not found' });
			}

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
		if (!locals.session) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await extractFormFromRequest(request, addTaskNoteSchema);

		await locals.appsSvc.addTaskNote({
			applicationId: formData.applicationId,
			content: formData.note,
			taskId: formData.taskId
		});
	}
} satisfies Actions;
