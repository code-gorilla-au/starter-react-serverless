import { type ZodObject, type ZodRawShape } from 'zod/v4';

export async function extractFormFromRequest<T extends ZodObject<ZodRawShape>>(
	request: Request,
	schema: T
) {
	const formData = await request.formData();
	const obj = Object.fromEntries(formData);

	return schema.parse(obj);
}

export function debouncedInput(fn: (input: string) => void, delay: number = 500) {
	let timeout: number;

	return (input: string) => {
		window.clearTimeout(timeout);
		timeout = window.setTimeout(() => {
			fn(input);
		}, delay);
	};
}
