import { z } from 'zod/v4';

export const noteDtoSchema = z.object({
	id: z.string(),
	content: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});

export type NoteDto = z.infer<typeof noteDtoSchema>;

export const applicationDtoStatus = z.enum([
	'applied',
	'interview',
	'offer',
	'rejected',
	'no-response'
]);

export type ApplicationDtoStatus = z.infer<typeof applicationDtoStatus>;

export const taskStatusDtoSchema = z.enum(['active', 'completed', 'closed', 'archived']);

export type TaskStatusDto = z.infer<typeof taskStatusDtoSchema>;

export const taskSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	createdAt: z.coerce.date(),
	dueDate: z.coerce.date().optional().nullable(),
	status: taskStatusDtoSchema,
	notes: z.array(noteDtoSchema)
});

export type TaskDto = z.infer<typeof taskSchema>;

export const applicationDtoSchema = z.object({
	id: z.string(),
	company: z.string(),
	position: z.string(),
	salary: z.string().optional().nullable(),
	url: z.url().optional().nullable(),
	startDate: z.coerce.date(),
	endDate: z.coerce.date().optional().nullable(),
	status: applicationDtoStatus,
	notes: z.array(noteDtoSchema),
	tasks: z.array(taskSchema).optional().nullable()
});

export type ApplicationDto = z.infer<typeof applicationDtoSchema>;

export const applicationDtoListSchema = z.array(applicationDtoSchema);
