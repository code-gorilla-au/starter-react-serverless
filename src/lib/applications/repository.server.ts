import type { StoreAction } from '$lib/server/database/interfaces';
import { logger } from '$lib/logging.server';
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
	DeleteItemCommand,
	type Condition,
	BatchWriteCommand
} from 'dynamodb-toolbox';
import { BatchDeleteRequest } from 'dynamodb-toolbox/entity/actions/batchDelete';
import { ItemNotFoundError } from '$lib/server/database/errors';
import { appTable } from '$lib/server/database';
import { nanoid } from 'nanoid';
import { execute } from 'dynamodb-toolbox/table/actions/batchWrite';

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
	insertApplicationNote(
		campaignId: string,
		applicationId: string,
		content: string
	): Promise<void>;
	updateApplicationNote(params: {
		campaignId: string;
		applicationId: string;
		note: Omit<NotesEntity, 'createdAt' | 'updatedAt'>;
	}): Promise<StoreAction>;
	deleteApplicationNote(params: {
		campaignId: string;
		applicationId: string;
		noteId: string;
	}): Promise<StoreAction>;
	getApplicationsForCampaign(
		campaignId: string,
		filter?: Condition<typeof applicationEntity>
	): Promise<StoreAction<ApplicationEntity[]>>;
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
	deleteTask(applicationId: string, taskId: string): Promise<StoreAction>;
	bulkDeleteTask(applicationId: string, tasks: TaskEntity[]): Promise<StoreAction>;
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
	async insertApplicationNote(campaignId: string, applicationId: string, content: string) {
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

	/**
	 * Updates a specific note within an application's notes.
	 */
	async updateApplicationNote(params: {
		campaignId: string;
		applicationId: string;
		note: Omit<NotesEntity, 'createdAt' | 'updatedAt'>;
	}): Promise<StoreAction> {
		this.#log.debug(
			{
				campaignId: params.campaignId,
				applicationId: params.applicationId,
				noteId: params.note.id
			},
			"updating application's note"
		);

		const model = await this.getApplicationById(params.applicationId, params.campaignId);
		if (model.error) {
			this.#log.error({ error: model.error.message }, 'could not get application by id');
			return {
				error: model.error
			};
		}

		if (!model.data) {
			const err = new ItemNotFoundError(params.applicationId, params.campaignId);

			this.#log.error(
				{
					error: err.message
				},
				'application not found'
			);

			return {
				error: err
			};
		}

		const notes = model.data?.notes ?? [];
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

		const cmd = applicationEntity.build(UpdateItemCommand).item({
			id: params.applicationId,
			campaignId: params.campaignId,
			notes: updatedNotes
		});

		await cmd.send();

		return {
			data: undefined
		};
	}

	/**
	 * Deletes a specific note from an application's notes.
	 */
	async deleteApplicationNote(params: {
		campaignId: string;
		applicationId: string;
		noteId: string;
	}): Promise<StoreAction> {
		this.#log.debug(
			{
				campaignId: params.campaignId,
				applicationId: params.applicationId,
				noteId: params.noteId
			},
			'deleting application note'
		);

		const model = await this.getApplicationById(params.applicationId, params.campaignId);
		if (model.error || !model.data) {
			return {
				error: model.error
			};
		}

		const notes = model.data?.notes ?? [];
		const updatedNotes = [...notes].filter((n) => n.id !== params.noteId);

		const cmd = applicationEntity.build(UpdateItemCommand).item({
			id: params.applicationId,
			campaignId: params.campaignId,
			notes: updatedNotes
		});

		await cmd.send();

		return {
			data: undefined
		};
	}

	/**
	 * Retrieves the list of applications associated with a specific campaign, optionally applying additional filters.
	 */
	async getApplicationsForCampaign(
		campaignId: string,
		filter?: Condition<typeof applicationEntity>
	): Promise<StoreAction<ApplicationEntity[]>> {
		let filters: Record<string, Condition<typeof applicationEntity>> | undefined = undefined;

		if (filter) {
			filters = { APPLICATION: filter };
		}

		const cmd = appTable
			.build(QueryCommand)
			.entities(applicationEntity)
			.query({
				index: 'GSI_INVERSE',
				partition: `APPLICATION#${campaignId}`
			})
			.options({
				filters
			});

		const output = await cmd.send();

		return {
			data: output.Items ?? []
		};
	}

	/**
	 * Deletes an application and its associated tasks from the system.
	 */
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

		await this.bulkDeleteTask(params.applicationId, models.data);

		const cmd = applicationEntity
			.build(DeleteItemCommand)
			.key({ campaignId: params.campaignId, id: params.applicationId });

		await cmd.send();

		return {
			data: undefined
		};
	}

	/**
	 * Deletes a specific task from the system.
	 */
	async deleteTask(applicationId: string, taskId: string): Promise<StoreAction> {
		const cmd = taskEntity.build(DeleteItemCommand).key({
			applicationId,
			id: taskId
		});

		await cmd.send();

		return {
			data: undefined
		};
	}

	/**
	 * Deletes a given array of tasks in bulk for the specified application.
	 *
	 * Processes the deletion of tasks in chunks for optimised performance and
	 * ensures that each chunk does not exceed the maximum limit for batch write requests.
	 */
	async bulkDeleteTask(applicationId: string, tasks: TaskEntity[]): Promise<StoreAction> {
		const taskChunks = chunk(tasks, 25);

		for (const tasks of taskChunks) {
			const deleteCmd = appTable.build(BatchWriteCommand).requests(
				...tasks.map((task) => {
					return taskEntity.build(BatchDeleteRequest).key({
						applicationId,
						id: task.id
					});
				})
			);

			await execute(deleteCmd);
		}

		return {
			data: undefined
		};
	}

	/**
	 * Inserts a new task into the storage system and retrieves the inserted task.
	 */
	async insertTask(
		task: Omit<TaskEntity, 'createdAt' | 'updatedAt'>
	): Promise<StoreAction<TaskEntity>> {
		this.#log.debug({ taskId: task.id, applicationId: task.applicationId }, 'inserting task');
		const cmd = taskEntity.build(PutItemCommand).item(task);
		await cmd.send();

		return await this.getTaskById(task.id, task.applicationId);
	}

	/**
	 * Inserts a new note for a specified task and updates the task entity.
	 */
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

	/**
	 * Updates a note for a specified task.
	 */
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

	/**
	 * Retrieves a task entity by its identifier and application ID.
	 */
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

	/**
	 * Updates the details of an existing task in the data store.
	 */
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

	/**
	 * Retrieves a list of tasks associated with a specific application.
	 */
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

/**
 * Splits an array into smaller arrays ("chunks") of a specified size.
 */
function chunk<T>(arr: T[], size: number): T[][] {
	const chunks: T[][] = [];

	for (let i = 0; i < arr.length; i += size) {
		chunks.push(arr.slice(i, i + size));
	}

	return chunks;
}
