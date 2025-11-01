import pino from 'pino';
import { loadServerEnv } from '$lib/env.server';

const config = loadServerEnv();

export const logger = pino({
	level: config.logLevel
});
