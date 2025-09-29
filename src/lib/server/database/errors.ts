export class ItemNotFoundError extends Error {
	constructor(pk: string, sk: string) {
		super(`Item not found: pk: ${pk} sk: ${sk}`);
	}
}
