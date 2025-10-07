import { type Actions, redirect } from '@sveltejs/kit';
import { extractFormFromRequest } from '$lib/forms';
import { z, ZodError } from 'zod/v4';
import { logger } from '$lib/logging.server';

const formSchema = z.object({
	email: z.email(),
	password: z.string().min(8),
	firstName: z.string().min(1),
	lastName: z.string().min(1)
});

export const actions = {
	default: async ({ locals, request }) => {
		try {
			const formData = await extractFormFromRequest(request, formSchema);

			await locals.userSvc.createUser({
				firstName: formData.firstName,
				lastName: formData.lastName,
				email: formData.email,
				password: formData.password
			});
		} catch (e) {
			if (e instanceof ZodError) {
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

		redirect(303, '/login');
	}
} satisfies Actions;
