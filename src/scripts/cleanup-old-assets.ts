#!/usr/bin/env node

import pino from 'pino';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
	strict: true,
	allowPositionals: false,
	options: {
		'dry-run': {
			type: 'boolean'
		},
		ignore: {
			type: 'string',
			multiple: true
		},
		bucket: {
			type: 'string'
		},
		region: {
			type: 'string',
			default: 'ap-southeast-2'
		},
		verbose: {
			type: 'boolean',
			short: 'v',
			default: false
		}
	}
});

const logger = pino({ level: values.verbose ? 'debug' : 'info' });

logger.debug(`Cli args: ${JSON.stringify(values, null, 2)}`);
