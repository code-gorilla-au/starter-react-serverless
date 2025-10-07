import {
	appTable,
	campaignEntity,
	type CampaignEntity,
	ItemNotFoundError,
	type StoreAction,
	userCampaignEntity,
	userDefaultCampaignEntity
} from '$lib/server/database';
import { GetItemCommand, PutTransaction, QueryCommand } from 'dynamodb-toolbox';
import { execute } from 'dynamodb-toolbox/entity/actions/transactWrite';
import { logger } from '$lib/logging.server';

export interface CampaignRepository {
	insertCampaign(
		userId: string,
		campaign: Omit<CampaignEntity, 'createdAt' | 'updatedAt'>
	): Promise<StoreAction<CampaignEntity>>;

	getDefaultCampaign(userId: string): Promise<StoreAction<CampaignEntity>>;

	getCampaignsForUser(userId: string): Promise<StoreAction<CampaignEntity[]>>;

	getCampaign(campaignId: string): Promise<StoreAction<CampaignEntity>>;
}

export class CampaignDBRepo implements CampaignRepository {
	#log = logger.child({ module: 'CampaignDBRepo' });

	/**
	 * Inserts a new campaign and associates it with a user.
	 */
	async insertCampaign(
		userId: string,
		campaign: Omit<CampaignEntity, 'createdAt' | 'updatedAt'>
	): Promise<StoreAction<CampaignEntity>> {
		this.#log.debug({ campaignId: campaign.id, userId: userId }, 'inserting new campaign');

		const putCampaign = campaignEntity.build(PutTransaction).item(campaign);
		const putCampaignUser = userCampaignEntity.build(PutTransaction).item({
			userId,
			campaignId: campaign.id,
			role: 'admin'
		});

		if (!campaign.isDefault) {
			await execute(putCampaign, putCampaignUser);
			return this.getCampaign(campaign.id);
		}

		const putDefault = userDefaultCampaignEntity.build(PutTransaction).item({
			userId,
			campaignId: campaign.id
		});

		await execute(putDefault, putCampaign, putCampaignUser);

		return this.getCampaign(campaign.id);
	}

	async getDefaultCampaign(userId: string): Promise<StoreAction<CampaignEntity>> {
		this.#log.debug({ userId }, 'getting default campaign for user');

		const cmd = userDefaultCampaignEntity.build(GetItemCommand).key({
			userId
		});
		const output = await cmd.send();

		if (!output.Item) {
			return {
				error: new ItemNotFoundError(userId, userId)
			};
		}

		return this.getCampaign(output.Item.campaignId);
	}

	async getCampaignsForUser(userId: string): Promise<StoreAction<CampaignEntity[]>> {
		this.#log.debug({ userId }, 'fetching applications for user');
		const cmd = appTable.build(QueryCommand).entities(userCampaignEntity).query({
			partition: userId
		});

		const output = await cmd.send();

		if (!output.Items) {
			return {
				data: []
			};
		}

		const campaigns: CampaignEntity[] = [];

		for (const item of output.Items) {
			const campaignOutput = await this.getCampaign(item.campaignId);
			if (campaignOutput.error) {
				return {
					error: campaignOutput.error
				};
			}

			if (!campaignOutput.data) {
				continue;
			}

			campaigns.push(campaignOutput.data);
		}

		return {
			data: campaigns
		};
	}

	/**
	 * Retrieves a campaign by its unique identifier.
	 */
	async getCampaign(campaignId: string): Promise<StoreAction<CampaignEntity>> {
		this.#log.debug({ campaignId }, 'getting campaign with id:');

		const cmd = campaignEntity.build(GetItemCommand).key({
			id: campaignId
		});

		const output = await cmd.send();
		if (!output.Item || !output.Item.id) {
			return {
				error: new ItemNotFoundError(campaignId, campaignId)
			};
		}

		return {
			data: output.Item
		};
	}
}
