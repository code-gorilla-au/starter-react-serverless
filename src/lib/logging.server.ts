import pino from 'pino';
import { loadServerEnv } from '$lib/server/env';

const config = loadServerEnv();

export const logger = pino({
	level: config.logLevel
});
