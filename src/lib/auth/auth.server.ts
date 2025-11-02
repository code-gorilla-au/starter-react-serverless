import { env } from '$env/dynamic/private';
import * as jose from 'jose';
import { AUTH_COOKIE_NAME, type UserSession } from '$lib/auth/types.server';
import type { Cookies } from '@sveltejs/kit';
import { loadServerEnv } from '$lib/env.server';

const appConfig = loadServerEnv();
const secret = new TextEncoder().encode(env.SECRET_APP_SIGNING_TOKEN);
const algorithm = 'HS256';
const issuer = 'com.delightable';
const audience = 'com.delightable';
const expiresIn = '48h';

export class AuthService {
	async sign(session: UserSession) {
		return await new jose.SignJWT(session)
			.setProtectedHeader({ alg: algorithm, typ: 'JWT' })
			.setIssuedAt()
			.setIssuer(issuer)
			.setAudience(audience)
			.setExpirationTime(expiresIn)
			.sign(secret);
	}

	async verify(token: string): Promise<UserSession> {
		const { payload } = await jose.jwtVerify<UserSession>(token, secret, {
			algorithms: [algorithm],
			issuer,
			audience
		});

		return payload;
	}
}

export function expireAuthCookie(cookieSvc: Cookies) {
	cookieSvc.delete(AUTH_COOKIE_NAME, {
		path: '/'
	});
}

export function attachAuthCookie(token: string, cookieSvc: Cookies) {
	cookieSvc.set(AUTH_COOKIE_NAME, token, {
		expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		secure: true,
		domain: appConfig.domain
	});
}
