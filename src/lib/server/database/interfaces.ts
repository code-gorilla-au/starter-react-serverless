export type StoreAction<T = null> = StoreActionSuccess<T> | StoreActionFailure;

export interface StoreActionSuccess<T> {
	data?: T;
	error?: never;
}

export interface StoreActionFailure {
	data?: never;
	error: Error;
}
