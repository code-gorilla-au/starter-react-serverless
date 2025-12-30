import { AUTH_COOKIE_NAME, type SessionFlashData, type UserSession } from '~/lib/auth/types';
import { loadServerEnv } from '~/lib/env/env.server';
import { createCookieSessionStorage } from 'react-router';

const appConfig = loadServerEnv();
const { getSession, commitSession, destroySession } = createCookieSessionStorage<
	UserSession,
	SessionFlashData
>({
	cookie: {
		name: AUTH_COOKIE_NAME,
		expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		secure: true,
		domain: appConfig.domain,
		secrets: [appConfig.secretAppSigningToken]
	}
});

export { getSession, commitSession, destroySession };
