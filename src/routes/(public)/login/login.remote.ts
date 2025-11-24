import { form, getRequestEvent } from '$app/server';
import { z } from 'zod/v4';
import { attachAuthCookie } from '$lib/auth';
import { error, redirect } from '@sveltejs/kit';
import { logger } from '$lib/logging.server';

export const login = form(
	z.object({ email: z.string(), password: z.string().min(8) }),
	async ({ email, password }) => {
		const { locals, cookies } = getRequestEvent();

		try {
			const user = await locals.userSvc.verifyUser(email, password);

			const token = await locals.authSvc.sign({
				userId: user.id,
				email: user.email,
				name: user.firstName + ' ' + user.lastName
			});

			attachAuthCookie(token, cookies);
		} catch (e) {
			const err = e as Error;
			logger.error({ error: err.message }, 'error logging in');

			return error(401, { message: 'Invalid credentials' });
		}

		return redirect(303, '/campaigns');
	}
);
