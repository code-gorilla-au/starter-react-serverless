import {
	type _Object,
	DeleteObjectsCommand,
	ListObjectsV2Command,
	type ListObjectsV2CommandOutput,
	S3Client
} from '@aws-sdk/client-s3';
import type { Logger } from 'pino';

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
	olderThan: Date;
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

	async cleanup(filter?: Filter): Promise<void> {
		let continuationToken: string | undefined = undefined;

		do {
			const { files, nextContinuationToken } = await this.queryAssets(
				continuationToken,
				filter
			);
			continuationToken = nextContinuationToken;

			const results = await this.removeAssets(files);

			if (results.errors.length) {
				throw new Error(`Failed to delete ${results.errors.length} assets`);
			}
		} while (continuationToken);
	}

	private async removeAssets(keys: string[]): Promise<DeleteResults> {
		const cmd = new DeleteObjectsCommand({
			Bucket: this.#bucket,
			Delete: { Objects: keys.map((key) => ({ Key: key })) }
		});

		const response = await this.#s3Client.send(cmd);
		this.#log.debug(`deleted: ${response?.Deleted?.length}`);
		this.#log.debug(`errors: ${response?.Errors?.length}`);

		const deleted =
			response?.Deleted?.map((d) => {
				return `${d.Key}`;
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
			if (!item.Key) {
				continue;
			}

			if (!filter) {
				results.push(item.Key);
				continue;
			}

			if (this.applyFilterIgnore(item.Key, filter.ignore ?? [])) {
				results.push(item.Key);
				continue;
			}

			if (filter.olderThan) {
				if (item.LastModified && item.LastModified < filter.olderThan) {
					results.push(item.Key);
					continue;
				}
			}

			results.push(item.Key);
		}

		return results;
	}

	private shouldFilterFile(item: _Object, filter?: Filter): boolean {
		if (!filter || !item.Key) {
			return false;
		}

		if (this.applyFilterIgnore(item?.Key, filter.ignore ?? [])) {
			return true;
		}

		if (filter.olderThan) {
			if (item.LastModified && item.LastModified < filter.olderThan) {
				return true;
			}
		}

		return false;
	}

	private applyFilterIgnore(key: string, ignoreMatches: string[]): boolean {
		if (ignoreMatches.length) {
			return false;
		}

		let ignoreFile: boolean = false;

		for (const ignore of ignoreMatches) {
			if (key.includes(ignore)) {
				ignoreFile = true;
			}
		}

		return ignoreFile;
	}
}
