import { type Actions, fail, redirect } from '@sveltejs/kit';
import { prettifyError, z, ZodError } from 'zod/v4';
import { taskStatusDtoSchema } from '$lib/applications/types';
import { extractFormFromRequest } from '$lib/forms';
import { authenticateUser } from '$lib/auth/queries.remote';

export const load = async ({ locals, params }) => {
	await authenticateUser();

	const task = await locals.appsSvc.getTask({
		applicationId: params.id,
		taskId: params.taskId
	});

	return {
		task
	};
};

const updateTaskSchema = z.object({
	name: z.string(),
	description: z.string(),
	status: taskStatusDtoSchema,
	dueDate: z.coerce.date().optional(),
	applicationId: z.string().min(1)
});

const updateTaskNoteSchema = z.object({
	noteId: z.string().min(1),
	content: z.string()
});

export const actions = {
	updateTask: async ({ locals, request, params }) => {
		await authenticateUser();

		if (!params?.taskId) {
			fail(400, 'task id is required');
			return;
		}

		const formData = await extractFormFromRequest(request, updateTaskSchema);

		await locals.appsSvc.updateTask(formData.applicationId, {
			description: formData.description,
			id: params?.taskId,
			name: formData.name,
			status: formData.status
		});

		redirect(301, `/applications/${params.id}`);
	},
	updateTaskNote: async ({ locals, request, params }) => {
		await authenticateUser();

		if (!params?.taskId) {
			fail(400, 'task id is required');
			return;
		}

		try {
			const formData = await extractFormFromRequest(request, updateTaskNoteSchema);

			await locals.appsSvc.updateTaskNote({
				taskId: params?.taskId,
				applicationId: params?.id as string,
				noteId: formData.noteId,
				note: formData.content
			});

			return {
				success: true
			};
		} catch (e) {
			if (e instanceof ZodError) {
				return {
					error: prettifyError(e)
				};
			}

			const err = e as Error;
			return {
				error: err.message
			};
		}
	}
} satisfies Actions;
