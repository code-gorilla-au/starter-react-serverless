#!/usr/bin/env node

import pino from 'pino';
import { parseArgs } from 'node:util';
import { S3Client } from '@aws-sdk/client-s3';
import { DeploymentAssetCleanup } from '$lib/infrastructure/s3';

const { values } = parseArgs({
	strict: true,
	allowPositionals: false,
	options: {
		'dry-run': {
			type: 'boolean',
			default: false
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

const logger = pino({ level: values.verbose ? 'debug' : 'info' }).child({
	script: 'cleanup-old-assets'
});
const s3Client = new S3Client({ region: values.region });
const deployCleanup = new DeploymentAssetCleanup(s3Client, values.bucket ?? '', logger);

logger.debug(`Cli args: ${JSON.stringify(values, null, 2)}`);

const oneDayAgo = new Date(new Date().setDate(new Date().getDate() - 1));

const results = await deployCleanup.cleanup(values['dry-run'], {
	ignore: values.ignore,
	olderThan: oneDayAgo
});

logger.info(
	`Deleted ${JSON.stringify(results.deleted, null, 2)} assets. Errors: ${results.errors.length}`
);
