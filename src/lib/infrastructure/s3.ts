import {
	type _Object,
	DeleteObjectsCommand,
	ListObjectsV2Command,
	type ListObjectsV2CommandOutput,
	S3Client
} from '@aws-sdk/client-s3';
import type { Logger } from 'pino';
import { isAfter } from 'date-fns';

export type IteratorResults = {
	files: string[];
	nextContinuationToken: string | undefined;
};

export type DeleteResults = {
	deleted: string[];
	errors: string[];
};

export type Filter = {
	ignore?: string[];
	olderThan?: Date;
};

export class DeploymentAssetCleanup {
	#s3Client: S3Client;
	#log: Logger;
	readonly #bucket: string;
	#maxKeys = 100;

	constructor(client: S3Client, bucket: string, logger: Logger) {
		this.#s3Client = client;
		this.#log = logger.child({ service: 'DeploymentAssetCleanup' });
		this.#bucket = bucket;
	}

	async cleanup(dryRun: boolean, filter?: Filter): Promise<DeleteResults> {
		let continuationToken: string | undefined = undefined;

		const runResults: DeleteResults = {
			deleted: [],
			errors: []
		};

		do {
			const { files, nextContinuationToken } = await this.queryAssets(
				continuationToken,
				filter
			);
			continuationToken = nextContinuationToken;

			if (dryRun) {
				this.#log.info(`dry run: ${files.length} assets found`);
				console.log(files);
				continue;
			}

			const results = await this.removeAssets(files);

			runResults.deleted.push(...results.deleted);
			runResults.errors.push(...results.errors);
		} while (continuationToken);

		return runResults;
	}

	private async removeAssets(keys: string[]): Promise<DeleteResults> {
		const cmd = new DeleteObjectsCommand({
			Bucket: this.#bucket,
			Delete: { Objects: keys.map((key) => ({ Key: key })) }
		});

		const response = await this.#s3Client.send(cmd);
		this.#log.debug(`deleted: ${response?.Deleted?.length}`);
		this.#log.debug(`errors: ${response?.Errors?.length ?? 0}`);

		const deleted =
			response?.Deleted?.map((d) => {
				return d.Key as string;
			}) ?? [];

		const errors =
			response?.Errors?.map((e) => {
				return `${e.Key}: ${e.Code} - ${e.Message}`;
			}) ?? [];

		return {
			deleted,
			errors
		};
	}

	private async queryAssets(
		continuationToken?: string,
		filter?: Filter
	): Promise<IteratorResults> {
		this.#log.debug(
			{ bucket: this.#bucket, token: continuationToken },
			'fetching assets from bucket'
		);

		const cmd = new ListObjectsV2Command({
			Bucket: this.#bucket,
			MaxKeys: this.#maxKeys,
			ContinuationToken: continuationToken
		});

		const response = await this.#s3Client.send(cmd);

		if (!response.Contents) {
			return { files: [], nextContinuationToken: response.ContinuationToken };
		}

		const results: string[] = this.applyFilter(response.Contents, filter);

		this.#log.debug({ results }, 'query results');

		return {
			files: results,
			nextContinuationToken: response.NextContinuationToken
		};
	}

	private applyFilter(
		contents: ListObjectsV2CommandOutput['Contents'],
		filter?: Filter
	): string[] {
		const results: string[] = [];

		if (!contents) {
			return results;
		}

		for (const item of contents) {
			if (this.shouldFilterFile(item, filter)) {
				continue;
			}

			results.push(item.Key as string);
		}

		return results;
	}

	private shouldFilterFile(item: _Object, filter?: Filter): boolean {
		if (!item.Key) {
			// skip if not a valid object
			return true;
		}

		if (!filter) {
			return false;
		}

		if (this.shouldIgnoreByMatch(item?.Key, filter.ignore ?? [])) {
			return true;
		}

		if (filter.olderThan) {
			if (item.LastModified && isAfter(item.LastModified, filter.olderThan)) {
				return true;
			}
		}

		return false;
	}

	private shouldIgnoreByMatch(key: string, ignoreMatches: string[]): boolean {
		let ignoreFile: boolean = false;

		for (const ignore of ignoreMatches) {
			if (key.includes(ignore)) {
				ignoreFile = true;
			}
		}

		return ignoreFile;
	}
}
