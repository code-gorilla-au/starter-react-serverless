import { beforeEach, describe, expect, it } from 'vitest';
import { DeploymentAssetCleanup } from '$lib/infrastructure/s3';
import pino from 'pino';
import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';

describe('S3 cleanup without continuation', () => {
	const client = new S3Client();
	const s3Mock = mockClient(client);
	const logger = pino({ level: 'debug' });

	const twoDaysAgo = new Date(new Date().setDate(new Date().getDate() - 2));
	const oneDayAgo = new Date(new Date().setDate(new Date().getDate() - 1));
	const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));

	beforeEach(() => {
		s3Mock.reset();
		s3Mock.on(ListObjectsV2Command).resolves({
			Contents: [
				{
					Key: 'test.jpg',
					LastModified: twoDaysAgo
				},
				{
					Key: 'test2.jpg',
					LastModified: new Date()
				}
			]
		});

		s3Mock.on(DeleteObjectsCommand).resolves({
			Deleted: [{ Key: 'test.jpg' }]
		});
	});

	it('without filter - should return 2 items deleted', async () => {
		s3Mock.on(DeleteObjectsCommand).resolvesOnce({
			Deleted: [{ Key: 'test.jpg' }, { Key: 'test2.jpg' }]
		});

		const deploy = new DeploymentAssetCleanup(client, '', logger);

		const total = await deploy.cleanup(false);

		expect(total.deleted.length).toEqual(2);
		expect(total.errors.length).toEqual(0);
	});

	describe('with dry-run', () => {
		it('should not call delete command', async () => {
			const deploy = new DeploymentAssetCleanup(client, '', logger);
			await deploy.cleanup(true);

			const delCalls = s3Mock.commandCalls(DeleteObjectsCommand);

			expect(delCalls).toEqual([]);
		});
	});
	describe('with ignore filter', () => {
		it('no matches should call delete command with 2 items', async () => {
			s3Mock.on(DeleteObjectsCommand).resolvesOnce({
				Deleted: [{ Key: 'test.jpg' }, { Key: 'test2.jpg' }]
			});

			const deploy = new DeploymentAssetCleanup(client, '', logger);

			const total = await deploy.cleanup(false, { ignore: ['does-not-exist.jpg'] });

			expect(total.deleted.length).toEqual(2);
			expect(total.errors.length).toEqual(0);
		});
		it('should call delete command with 1 item', async () => {
			s3Mock.on(DeleteObjectsCommand).resolvesOnce({
				Deleted: [{ Key: 'test2.jpg' }]
			});

			const deploy = new DeploymentAssetCleanup(client, '', logger);

			await deploy.cleanup(false, { ignore: ['test.jpg'] });

			const delCalls = s3Mock.commandCalls(DeleteObjectsCommand);

			expect(delCalls[0].args[0].input?.Delete?.Objects).toEqual([{ Key: 'test2.jpg' }]);
		});
		it('should return 1 item deleted', async () => {
			s3Mock.on(DeleteObjectsCommand).resolvesOnce({
				Deleted: [{ Key: 'test2.jpg' }]
			});

			const deploy = new DeploymentAssetCleanup(client, '', logger);

			const results = await deploy.cleanup(false, { ignore: ['test.jpg'] });

			expect(results.deleted.length).toEqual(1);
			expect(results.deleted[0]).toEqual('test2.jpg');
		});
	});

	describe('with date filter', () => {
		it('older than tomorrow - should return 2 items deleted', async () => {
			s3Mock.on(DeleteObjectsCommand).resolvesOnce({
				Deleted: [{ Key: 'test.jpg' }, { Key: 'test2.jpg' }]
			});

			const deploy = new DeploymentAssetCleanup(client, '', logger);

			const results = await deploy.cleanup(false, { olderThan: tomorrow });

			expect(results.deleted.length).toEqual(2);
		});
		it('older than tomorrow - should call delete command with 2 items', async () => {
			s3Mock.on(DeleteObjectsCommand).resolvesOnce({
				Deleted: [{ Key: 'test.jpg' }, { Key: 'test2.jpg' }]
			});

			const deploy = new DeploymentAssetCleanup(client, '', logger);

			await deploy.cleanup(false, { olderThan: tomorrow });
			const delCalls = s3Mock.commandCalls(DeleteObjectsCommand);

			expect(delCalls[0].args[0].input?.Delete?.Objects).toEqual([
				{ Key: 'test.jpg' },
				{ Key: 'test2.jpg' }
			]);
		});
		it('older than one day ago - should return 1 item deleted', async () => {
			const deploy = new DeploymentAssetCleanup(client, '', logger);

			const results = await deploy.cleanup(false, { olderThan: oneDayAgo });

			expect(results.deleted.length).toEqual(1);
			expect(results.deleted[0]).toEqual('test.jpg');
		});
		it('older than one day ago - should call delete command with 1 item', async () => {
			const deploy = new DeploymentAssetCleanup(client, '', logger);

			await deploy.cleanup(false, { olderThan: oneDayAgo });

			const delCalls = s3Mock.commandCalls(DeleteObjectsCommand);

			expect(delCalls[0].args[0].input?.Delete?.Objects).toEqual([{ Key: 'test.jpg' }]);
		});
	});
});
