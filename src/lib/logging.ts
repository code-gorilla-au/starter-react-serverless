import pino from 'pino';

const level = 'debug';

export const logger = pino({
	level
});
