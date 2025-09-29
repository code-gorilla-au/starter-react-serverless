import { z } from 'zod/v4';

export const noteDtoSchema = z.object({
	id: z.string(),
	content: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});

export type NoteDto = z.infer<typeof noteDtoSchema>;

export const campaignDtoStatus = z.enum(['active', 'completed', 'archived']);

export const campaignDtoSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	status: campaignDtoStatus,
	notes: z.array(noteDtoSchema),
	startDate: z.coerce.date(),
	endDate: z.coerce.date().optional().nullable(),
	isDefault: z.boolean()
});

export const campaignDtoListSchema = z.array(campaignDtoSchema);

export type CampaignDto = z.infer<typeof campaignDtoSchema>;
