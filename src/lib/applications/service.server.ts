import { ApplicationDBRepo, type ApplicationRepository } from '$lib/applications/repository.server';
import { logger } from '$lib/logging.server';
import {
	type ApplicationDto,
	applicationDtoListSchema,
	applicationDtoSchema,
	type TaskDto,
	taskSchema
} from '$lib/applications/types';
import { nanoid } from 'nanoid';
import { applicationEntity, type ApplicationEntity, type TaskEntity } from '$lib/server/database';
import { compareDesc } from 'date-fns';
import type { Condition } from 'dynamodb-toolbox';

export class ApplicationsService {
	#log = logger.child({ module: 'ApplicationsService' });
	#repo: ApplicationRepository;

	constructor(repo: ApplicationRepository) {
		this.#repo = repo;
	}

	/**
	 * Creates a new application for a specific campaign.
	 */
	async createApplication(
		campaignId: string,
		application: Omit<ApplicationDto, 'id' | 'status' | 'notes' | 'tasks' | 'endDate'>
	): Promise<ApplicationDto> {
		const model = await this.#repo.insertApplication({
			id: nanoid(),
			url: application.url ?? undefined,
			company: application.company,
			position: application.position,
			salary: application.salary ?? '',
			status: 'applied',
			campaignId: campaignId,
			startDate: application.startDate.toISOString(),
			notes: []
		});

		if (model.error) {
			throw model.error;
		}

		return applicationDtoSchema.parse({
			...model.data,
			tasks: []
		});
	}

	/**
	 * Updates an application record in the repository based on the provided details.
	 */
	async updateApplication(campaignId: string, application: ApplicationDto): Promise<void> {
		await this.#repo.updateApplication({
			company: application.company,
			position: application.position,
			salary: application.salary ?? '',
			startDate: application.startDate.toISOString(),
			status: application.status,
			endDate: application.endDate?.toISOString(),
			url: application.url ?? undefined,
			campaignId,
			id: application.id
		});
	}

	/**
	 * Retrieves the application data based on the provided campaign and application identifiers.
	 */
	async getApplication(campaignId: string, applicationId: string): Promise<ApplicationDto> {
		const modelApp = await this.#repo.getApplicationById(applicationId, campaignId);

		if (modelApp.error) {
			throw modelApp.error;
		}

		if (!modelApp.data) {
			throw new Error('Application not found');
		}

		const result: ApplicationEntity & { tasks: TaskEntity[] } = {
			...modelApp.data,
			notes: [...modelApp.data.notes],
			tasks: []
		};

		const modelTasks = await this.#repo.getTasksForApplication(applicationId);
		if (modelTasks.error) {
			throw modelTasks.error;
		}

		result.tasks = modelTasks.data ?? [];

		result.tasks.sort((a, b) => {
			return compareDesc(a.createdAt, b.createdAt);
		});

		return applicationDtoSchema.parse(result);
	}

	/**
	 * Adds a note to a specific application within a campaign.
	 */
	async addApplicationNote(campaignId: string, applicationId: string, content: string) {
		await this.#repo.insertApplicationNote(campaignId, applicationId, content);
	}

	/**
	 * Updates an existing application note with the specified content.
	 */
	async updateApplicationNote(params: {
		campaignId: string;
		applicationId: string;
		noteId: string;
		content: string;
	}) {
		await this.#repo.updateApplicationNote({
			campaignId: params.campaignId,
			applicationId: params.applicationId,
			note: {
				id: params.noteId,
				content: params.content
			}
		});
	}

	async deleteApplicationNote(params: {
		campaignId: string;
		applicationId: string;
		noteId: string;
	}) {
		await this.#repo.deleteApplicationNote({
			campaignId: params.campaignId,
			applicationId: params.applicationId,
			noteId: params.noteId
		});
	}

	/**
	 * Fetches and returns the list of active applications for a specified campaign.
	 */
	async getActiveApplications(campaignId: string): Promise<ApplicationDto[]> {
		return this.getApplicationsWithFilter(campaignId, 'active');
	}

	/**
	 * Retrieves a list of applications which have been completed for the specified campaign.
	 */
	async getCompleteApplications(campaignId: string): Promise<ApplicationDto[]> {
		return this.getApplicationsWithFilter(campaignId, 'complete');
	}

	/**
	 * Get applications by campaign ID.
	 */
	private async getApplicationsWithFilter(
		campaignId: string,
		status?: 'active' | 'complete'
	): Promise<ApplicationDto[]> {
		const filterCondition = resolveApplicationFilter(status);

		const models = await this.#repo.getApplicationsForCampaign(campaignId, filterCondition);
		if (models.error) {
			this.#log.error({ error: models.error.message }, 'could not get applications');
			throw models.error;
		}

		return applicationDtoListSchema.parse(models.data);
	}

	/**
	 * Deletes an application associated with a specific campaign.
	 */
	async deleteApplication(campaignId: string, applicationId: string): Promise<void> {
		await this.#repo.deleteApplication({
			campaignId,
			applicationId
		});
	}

	/**
	 * Deletes multiple applications associated with a specific campaign.
	 */
	async bulkDeleteApplications(campaignId: string, applications: string[]): Promise<void> {
		for (const application of applications) {
			await this.#repo.deleteApplication({
				campaignId,
				applicationId: application
			});
		}
	}

	/**
	 * Adds a new task to the specified application.
	 */
	async addTaskToApplication(
		applicationId: string,
		task: { name: string; description: string; dueDate?: Date }
	) {
		const taskModel = await this.#repo.insertTask({
			...task,
			id: nanoid(),
			status: 'active',
			applicationId: applicationId,
			dueDate: task.dueDate?.toISOString(),
			notes: []
		});

		if (taskModel.error) {
			this.#log.error({ error: taskModel.error.message }, 'error getting task model');

			throw taskModel.error;
		}

		return taskSchema.parse(taskModel.data);
	}

	/**
	 * Adds a note to a specific task.
	 */
	async addTaskNote(params: { taskId: string; applicationId: string; content: string }) {
		this.#log.debug(
			{ taskId: params.taskId, applicationId: params.applicationId },
			'adding task note'
		);

		await this.#repo.insertTaskNote({
			taskId: params.taskId,
			applicationId: params.applicationId,
			content: params.content
		});
	}

	/**
	 * Updates the note associated with a specific task and application.
	 */
	async updateTaskNote(params: {
		taskId: string;
		applicationId: string;
		noteId: string;
		note: string;
	}) {
		await this.#repo.updateTaskNote({
			taskId: params.taskId,
			applicationId: params.applicationId,
			note: {
				id: params.noteId,
				content: params.note
			}
		});
	}

	/**
	 * Fetches a specific task associated with a given application ID and task ID.
	 */
	async getTask(params: { applicationId: string; taskId: string }) {
		const model = await this.#repo.getTaskById(params.taskId, params.applicationId);
		if (model.error) {
			this.#log.error({ error: model.error }, 'could not get task for application');

			throw model.error;
		}

		if (!model.data) {
			throw new Error(`task: ${params.taskId} not found`);
		}

		return taskSchema.parse(model.data);
	}

	/**
	 * Updates a task associated with a specific application.
	 */
	async updateTask(applicationId: string, task: Omit<TaskDto, 'createdAt' | 'notes'>) {
		const model = await this.#repo.updateTask({
			id: task.id,
			applicationId: applicationId,
			name: task.name,
			description: task.description,
			status: task.status
		});

		if (model.error) {
			throw model.error;
		}
	}
}

/**
 * Factory function to create an instance of CampaignsService.
 */
export function applicationServiceFactory() {
	const repo = new ApplicationDBRepo();
	return new ApplicationsService(repo);
}

function resolveApplicationFilter(
	status?: 'active' | 'complete'
): Condition<typeof applicationEntity> | undefined {
	if (!status) {
		return undefined;
	}

	if (status === 'active') {
		return {
			attr: 'status',
			in: ['applied', 'interview']
		};
	}

	return {
		attr: 'status',
		in: ['rejected', 'no-response', 'offer']
	};
}
