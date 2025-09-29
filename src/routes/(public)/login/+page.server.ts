import { type Actions, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { extractFormFromRequest } from '$lib/forms';
import { logger } from '$lib/logging';
import { attachAuthCookie } from '$lib/server/auth';

const formSchema = z.object({
	email: z.email(),
	password: z.string().min(8)
});

export const actions = {
	default: async ({ locals, request, cookies }) => {
		try {
			const data = await extractFormFromRequest(request, formSchema);
			const user = await locals.userSvc.verifyUser(data.email, data.password);

			const token = await locals.authSvc.sign({
				userId: user.id,
				email: user.email,
				name: user.firstName + ' ' + user.lastName
			});

			attachAuthCookie(token, cookies);
		} catch (e) {
			const err = e as Error;
			logger.error({ error: err.message }, 'error signing in user');
			return fail(401, {
				error: 'Invalid credentials'
			});
		}

		redirect(303, '/campaigns');
	}
} satisfies Actions;
