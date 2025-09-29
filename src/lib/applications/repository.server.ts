import type { StoreAction } from '$lib/server/database/interfaces';
import { logger } from '$lib/logging';
import {
	applicationEntity,
	type ApplicationEntity,
	type NotesEntity,
	taskEntity,
	type TaskEntity
} from '$lib/server/database/entities';
import {
	$prepend,
	GetItemCommand,
	PutItemCommand,
	QueryCommand,
	UpdateItemCommand,
	DeleteItemCommand
} from 'dynamodb-toolbox';
import { ItemNotFoundError } from '$lib/server/database/errors';
import { appTable } from '$lib/server/database';
import { nanoid } from 'nanoid';

export interface ApplicationRepository {
	insertApplication(
		application: Omit<ApplicationEntity, 'createdAt' | 'updatedAt'>
	): Promise<StoreAction<ApplicationEntity>>;
	updateApplication(
		application: Omit<ApplicationEntity, 'createdAt' | 'updatedAt' | 'notes'>
	): Promise<StoreAction>;
	getApplicationById(
		applicationId: string,
		campaignId: string
	): Promise<StoreAction<ApplicationEntity>>;
	deleteApplication(params: { campaignId: string; applicationId: string }): Promise<StoreAction>;
	getTasksForApplication(applicationId: string): Promise<StoreAction<TaskEntity[]>>;
	addNoteToApplication(campaignId: string, applicationId: string, content: string): Promise<void>;
	getApplicationsForCampaign(campaignId: string): Promise<StoreAction<ApplicationEntity[]>>;
	insertTask(task: Omit<TaskEntity, 'createdAt' | 'updatedAt'>): Promise<StoreAction<TaskEntity>>;
	insertTaskNote(params: {
		taskId: string;
		applicationId: string;
		content: string;
	}): Promise<StoreAction>;
	getTaskById(taskId: string, applicationId: string): Promise<StoreAction<TaskEntity>>;
	updateTask(
		updatedTask: Omit<TaskEntity, 'createdAt' | 'updatedAt' | 'notes'>
	): Promise<StoreAction<TaskEntity>>;
	updateTaskNote(params: {
		taskId: string;
		applicationId: string;
		note: Omit<NotesEntity, 'createdAt' | 'updatedAt'>;
	}): Promise<StoreAction>;
}

export class ApplicationDBRepo implements ApplicationRepository {
	#log = logger.child({ module: 'ApplicationDBRepo' });

	/**
	 * Inserts a new application into the datastore.
	 */
	async insertApplication(
		application: Omit<ApplicationEntity, 'createdAt' | 'updatedAt'>
	): Promise<StoreAction<ApplicationEntity>> {
		this.#log.debug(
			{ applicationId: application.id, campaignId: application.campaignId },
			'inserting new application'
		);

		const cmd = applicationEntity.build(PutItemCommand).item(application);

		await cmd.send();

		return this.getApplicationById(application.id, application.campaignId);
	}

	/**
	 * Updates an existing application in the store with the provided details.
	 */
	async updateApplication(
		application: Omit<ApplicationEntity, 'createdAt' | 'updatedAt' | 'notes'>
	): Promise<StoreAction> {
		const cmd = applicationEntity.build(UpdateItemCommand).item({
			id: application.id,
			campaignId: application.campaignId,
			company: application.company,
			position: application.position,
			salary: application.salary,
			status: application.status,
			url: application.url,
			startDate: application.startDate,
			endDate: application.endDate,
			updatedAt: new Date().toISOString()
		});

		await cmd.send();

		return {
			data: undefined
		};
	}

	/**
	 * Retrieves an application by its ID and campaign ID.
	 */
	async getApplicationById(
		applicationId: string,
		campaignId: string
	): Promise<StoreAction<ApplicationEntity>> {
		this.#log.debug(
			{ applicationId: applicationId, campaignId: campaignId },
			'getting application with id'
		);

		const cmd = applicationEntity.build(GetItemCommand).key({
			campaignId,
			id: applicationId
		});

		const output = await cmd.send();
		if (!output.Item || !output.Item.id) {
			return {
				error: new ItemNotFoundError(applicationId, campaignId)
			};
		}

		return {
			data: output.Item
		};
	}

	/**
	 * Adds a note to a specific application within a campaign.
	 */
	async addNoteToApplication(campaignId: string, applicationId: string, content: string) {
		this.#log.debug({ campaignId, applicationId }, 'adding note to application');

		const note: NotesEntity = {
			id: nanoid(),
			content: content,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		const app: ApplicationEntity = {
			id: applicationId,
			campaignId: campaignId,
			// @ts-expect-error - note: following documentation, TS having issues.
			notes: $prepend([note])
		};

		const cmd = applicationEntity.build(UpdateItemCommand).item(app);

		await cmd.send();
	}

	async getApplicationsForCampaign(
		campaignId: string
	): Promise<StoreAction<ApplicationEntity[]>> {
		const cmd = appTable
			.build(QueryCommand)
			.entities(applicationEntity)
			.query({
				index: 'GSI_INVERSE',
				partition: `APPLICATION#${campaignId}`
			});

		const output = await cmd.send();

		return {
			data: output.Items ?? []
		};
	}

	async deleteApplication(params: {
		campaignId: string;
		applicationId: string;
	}): Promise<StoreAction> {
		const models = await this.getTasksForApplication(params.applicationId);

		if (models.error) {
			this.#log.error({ error: models.error.message }, 'error getting tasks');

			return {
				error: models.error
			};
		}

		if (!models.data) {
			this.#log.error({ error: 'not found' }, 'no tasks found');

			return {
				error: new Error('items not found')
			};
		}

		for (const task of models.data) {
			const taskCmd = taskEntity.build(DeleteItemCommand).key({
				applicationId: params.applicationId,
				id: task.id
			});

			await taskCmd.send();
		}

		const cmd = applicationEntity
			.build(DeleteItemCommand)
			.key({ campaignId: params.campaignId, id: params.applicationId });

		await cmd.send();

		return {
			data: undefined
		};
	}

	async insertTask(
		task: Omit<TaskEntity, 'createdAt' | 'updatedAt'>
	): Promise<StoreAction<TaskEntity>> {
		this.#log.debug({ taskId: task.id, applicationId: task.applicationId }, 'inserting task');
		const cmd = taskEntity.build(PutItemCommand).item(task);
		await cmd.send();

		return await this.getTaskById(task.id, task.applicationId);
	}

	async insertTaskNote(params: {
		taskId: string;
		applicationId: string;
		content: string;
	}): Promise<StoreAction> {
		const note: NotesEntity = {
			id: nanoid(),
			content: params.content,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		const task: TaskEntity = {
			id: params.taskId,
			applicationId: params.applicationId,
			// @ts-expect-error - note: following documentation, TS having issues.
			notes: $prepend([note])
		};

		const cmd = taskEntity.build(UpdateItemCommand).item(task);
		await cmd.send();

		return {
			data: undefined
		};
	}

	async updateTaskNote(params: {
		taskId: string;
		applicationId: string;
		note: Omit<NotesEntity, 'createdAt' | 'updatedAt'>;
	}): Promise<StoreAction> {
		const task = await this.getTaskById(params.taskId, params.applicationId);
		if (task.error) {
			this.#log.error({ error: task.error.message }, 'could not get task');

			return {
				error: task.error
			};
		}

		if (!task.data) {
			this.#log.error({ error: `${params.taskId} not found` }, 'task not found');

			return {
				error: new Error('Task not found')
			};
		}

		const notes = task.data.notes ?? [];

		const updatedNotes = [...notes].map((n) => {
			if (n.id === params.note.id) {
				return {
					...n,
					content: params.note.content,
					updatedAt: new Date().toISOString()
				};
			}

			return n;
		});

		const cmd = taskEntity.build(UpdateItemCommand).item({
			id: params.taskId,
			applicationId: params.applicationId,
			notes: updatedNotes
		});
		await cmd.send();

		return {
			data: undefined
		};
	}

	async getTaskById(taskId: string, applicationId: string): Promise<StoreAction<TaskEntity>> {
		this.#log.debug({ taskId, applicationId }, 'getting task by id');

		const cmd = taskEntity.build(GetItemCommand).key({
			id: taskId,
			applicationId: applicationId
		});

		const output = await cmd.send();

		if (!output?.Item || !output?.Item?.id) {
			return {
				error: new ItemNotFoundError(taskId, applicationId)
			};
		}

		return {
			data: output.Item
		};
	}

	async updateTask(
		updatedTask: Omit<TaskEntity, 'createdAt' | 'updatedAt' | 'notes'>
	): Promise<StoreAction<TaskEntity>> {
		const cmd = taskEntity.build(UpdateItemCommand).item({
			id: updatedTask.id,
			name: updatedTask.name,
			description: updatedTask.description,
			status: updatedTask.status,
			applicationId: updatedTask.applicationId
		});
		await cmd.send();

		return {
			data: undefined
		};
	}

	async getTasksForApplication(applicationId: string): Promise<StoreAction<TaskEntity[]>> {
		const cmd = appTable
			.build(QueryCommand)
			.entities(taskEntity)
			.query({
				index: 'GSI_INVERSE',
				partition: `TASK#${applicationId}`
			});

		const output = await cmd.send();

		return {
			data: output.Items ?? []
		};
	}
}
