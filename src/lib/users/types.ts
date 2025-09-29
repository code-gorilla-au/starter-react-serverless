import { z } from 'zod/v4';

export const userSchema = z.object({
	id: z.string(),
	email: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	status: z.enum(['active', 'inactive', 'pending']),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});

export type UserDto = z.infer<typeof userSchema>;
