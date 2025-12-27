import { describe, it, expect } from 'vitest';
import { loadServerEnv } from '~/lib/env.server';

describe('loadServerEnv()', () => {
	it('should load server environment variables', () => {
		const config = loadServerEnv();

		expect(config).toEqual({
			appTableName: 'delightable',
			domain: '.localhost',
			dynamoEndpoint: 'http://localhost:8110',
			logLevel: 'debug',
			secretAppSigningToken: 'some-secret-token'
		});
	});
});
