import { type ZodObject, type ZodRawShape } from 'zod/v4';

export async function extractFormFromRequest<T extends ZodObject<ZodRawShape>>(
	request: Request,
	schema: T
) {
	const formData = await request.formData();
	const obj = Object.fromEntries(formData);

	return schema.parse(obj);
}
