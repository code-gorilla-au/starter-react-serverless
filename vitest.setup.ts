import { beforeAll, afterAll, vi } from 'vitest';

beforeAll(() => {
	vi.stubEnv('DOMAIN', '.localhost');
	vi.stubEnv('VITE_LOG_LEVEL', 'debug');
	vi.stubEnv('SECRET_APP_SIGNING_TOKEN', 'some-secret-token');
	vi.stubEnv('LOCAL_DYNAMODB_ENDPOINT', 'http://localhost:8110');
});

afterAll(() => {
	vi.unstubAllEnvs();
});
