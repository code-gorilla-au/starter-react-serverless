import { Entity, type FormattedValue } from 'dynamodb-toolbox';
import { appTable } from '$lib/server/database/tables';
import { s } from 'dynamodb-toolbox';

function now() {
	return new Date().toISOString();
}

const userSchema = s.item({
	email: s.string().key(),
	id: s.string(),
	password: s.string().required('always'),
	firstName: s.string().required('always'),
	lastName: s.string().required('always'),
	status: s.string().enum('active', 'pending', 'inactive').required('always'),
	createdAt: s.string().required('always').putDefault(now),
	updatedAt: s.string().required('always').putDefault(now).updateDefault(now)
});

export type UserEntity = FormattedValue<typeof userSchema>;

export const userEntity = new Entity({
	name: 'USER',
	table: appTable,
	timestamps: false,
	computeKey({ email }) {
		return {
			pk: email,
			sk: email
		};
	},
	schema: userSchema
});

export const notesSchema = s.map({
	id: s.string().required('atLeastOnce'),
	content: s.string().required('atLeastOnce'),
	createdAt: s.string().required('atLeastOnce').putDefault(now),
	updatedAt: s.string().required('always').putDefault(now).updateDefault(now)
});

export type NotesEntity = FormattedValue<typeof notesSchema>;

const campaignSchema = s.item({
	id: s.string().key().required('always'),
	name: s.string().required('atLeastOnce'),
	description: s.string(),
	status: s.string().enum('active', 'completed', 'archived').required('always'),
	notes: s.list(notesSchema).default([]),
	startDate: s.string().required('atLeastOnce'),
	endDate: s.string().optional(),
	isDefault: s.boolean().required('atLeastOnce'),
	createdAt: s.string().required('always').putDefault(now),
	updatedAt: s.string().required('always').putDefault(now).updateDefault(now)
});

export type CampaignEntity = FormattedValue<typeof campaignSchema>;

export const campaignEntity = new Entity({
	name: 'CAMPAIGN',
	table: appTable,
	timestamps: false,
	schema: campaignSchema,
	computeKey({ id }) {
		return {
			pk: id,
			sk: id
		};
	}
});

export const userCampaignSchema = s.map({
	userId: s.string().key().required('always'),
	campaignId: s.string().key().required('always'),
	role: s.string().enum('admin', 'editor', 'viewer').required('atLeastOnce'),
	createdAt: s.string().required('always').putDefault(now),
	updatedAt: s.string().required('always').putDefault(now).updateDefault(now)
});

export type UserCampaignEntity = FormattedValue<typeof userCampaignSchema>;

export const userCampaignEntity = new Entity({
	name: 'USER_CAMPAIGN',
	table: appTable,
	timestamps: false,
	schema: userCampaignSchema,
	computeKey({ userId, campaignId }) {
		return {
			pk: userId,
			sk: campaignId
		};
	}
});

export const userDefaultCampaignSchema = s.map({
	userId: s.string().key().required('always'),
	campaignId: s.string().required('always'),
	createdAt: s.string().required('always').putDefault(now),
	updatedAt: s.string().required('always').putDefault(now).updateDefault(now)
});

export const userDefaultCampaignEntity = new Entity({
	name: 'USER_DEFAULT_CAMPAIGN',
	table: appTable,
	schema: userDefaultCampaignSchema,
	computeKey({ userId }) {
		return {
			pk: `CAMPAIGN#${userId}`,
			sk: `CAMPAIGN#${userId}`
		};
	}
});

export const taskSchema = s.item({
	id: s.string().key(),
	applicationId: s.string().key(),
	name: s.string().required('atLeastOnce'),
	description: s.string().optional(),
	status: s.string().enum('active', 'completed', 'closed', 'archived').required('atLeastOnce'),
	notes: s.list(notesSchema).default([]),
	dueDate: s.string().optional(),
	createdAt: s.string().required('atLeastOnce').putDefault(now),
	updatedAt: s.string().required('atLeastOnce').putDefault(now).updateDefault(now)
});

export type TaskEntity = FormattedValue<typeof taskSchema>;

export const taskEntity = new Entity({
	name: 'TASK',
	table: appTable,
	timestamps: false,
	schema: taskSchema,
	computeKey({ id, applicationId }) {
		return {
			pk: `TASK#${id}`,
			sk: `TASK#${applicationId}`
		};
	}
});

export const applicationSchema = s.item({
	id: s.string().key(),
	campaignId: s.string().key(),
	company: s.string().required('atLeastOnce'),
	position: s.string().required('atLeastOnce'),
	salary: s.string().optional().required('atLeastOnce'),
	status: s
		.string()
		.enum('applied', 'interview', 'offer', 'rejected', 'no-response')
		.required('atLeastOnce'),
	url: s.string().optional(),
	startDate: s.string().required('atLeastOnce'),
	endDate: s.string().optional(),
	notes: s.list(notesSchema).default([]),
	createdAt: s.string().required('atLeastOnce').putDefault(now),
	updatedAt: s.string().required('atLeastOnce').putDefault(now).updateDefault(now)
});

export type ApplicationEntity = FormattedValue<typeof applicationSchema>;

export const applicationEntity = new Entity({
	name: 'APPLICATION',
	table: appTable,
	timestamps: false,
	computeKey({ id, campaignId }) {
		return {
			pk: `APPLICATION#${id}`,
			sk: `APPLICATION#${campaignId}`
		};
	},
	schema: applicationSchema
});
