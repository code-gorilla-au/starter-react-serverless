import { logger } from '$lib/logging.server';
import { CampaignDBRepo, type CampaignRepository } from '$lib/campaigns/repository.server';
import { type CampaignDto, campaignDtoListSchema, campaignDtoSchema } from '$lib/campaigns/types';
import { nanoid } from 'nanoid';

export class CampaignService {
	#log = logger.child({ module: 'ApplicationsService' });
	#repo: CampaignRepository;
	#defaultCampaign: Record<string, CampaignDto> = {};

	constructor(repo: CampaignRepository) {
		this.#repo = repo;
	}

	/**
	 * Creates a new campaign for the specified user.
	 */
	async createCampaign(
		userId: string,
		campaign: {
			name: string;
			description: string;
			startDate: Date;
			isDefault: boolean;
		}
	) {
		this.#log.debug({ userId, name: campaign.name }, 'creating campaign for user');

		const data = campaignDtoSchema.parse({
			...campaign,
			id: nanoid(),
			status: 'active',
			notes: [],
			isDefault: campaign.isDefault ?? false
		});

		const model = await this.#repo.insertCampaign(userId, {
			description: data.description,
			endDate: data?.endDate?.toISOString(),
			id: data.id,
			isDefault: data.isDefault,
			status: data.status,
			name: data.name,
			notes: data.notes.map((item) => {
				return {
					...item,
					createdAt: item.createdAt.toISOString(),
					updatedAt: new Date().toISOString()
				};
			}),
			startDate: data.startDate.toISOString()
		});

		if (model.error) {
			this.#log.error({ error: model.error.message }, 'error creating application');
			throw model.error;
		}

		if (model.data?.isDefault) {
			delete this.#defaultCampaign[userId];
		}

		return campaignDtoSchema.parse(model.data);
	}

	/**
	 * Retrieves a list of campaigns associated with a specific user.
	 */
	async getCampaignsForUser(userId: string): Promise<CampaignDto[]> {
		const model = await this.#repo.getCampaignsForUser(userId);
		if (model.error) {
			throw model.error;
		}

		return campaignDtoListSchema.parse(model.data);
	}

	/**
	 * Retrieves the default campaign associated with a given user.
	 */
	async getDefaultCampaign(userId: string): Promise<CampaignDto | undefined> {
		const cache = this.#defaultCampaign[userId];
		if (cache) {
			return campaignDtoSchema.parse(cache);
		}

		const model = await this.#repo.getDefaultCampaign(userId);
		if (model.error) {
			return undefined;
		}

		this.#defaultCampaign[userId] = campaignDtoSchema.parse(model.data);

		return this.#defaultCampaign[userId];
	}
}

export function campaignServiceFactory() {
	const db = new CampaignDBRepo();
	return new CampaignService(db);
}
