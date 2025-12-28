import { describe, it, expect } from 'vitest';
import { loadClientEnv } from '~/lib/env/env.client';

describe('loadClientEnv()', () => {
	it('should load client side env vars', () => {
		expect(loadClientEnv()).toEqual({
			foo: 'world'
		});
	});
});
