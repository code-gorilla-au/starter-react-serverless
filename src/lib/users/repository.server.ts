import { logger } from '$lib/logging.server';
import {
	ItemNotFoundError,
	type StoreAction,
	type UserEntity,
	userEntity
} from '$lib/server/database';
import { GetItemCommand, PutItemCommand } from 'dynamodb-toolbox';

export interface UserRepository {
	insertUser(user: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		password: string;
	}): Promise<StoreAction<UserEntity>>;
	getUserByEmail(email: string): Promise<StoreAction<UserEntity>>;
}

export class UserDBRepo implements UserRepository {
	#log = logger.child({ module: 'UserDBRepo' });

	/**
	 * Inserts a user into the data store with the provided information.
	 */
	async insertUser(user: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		password: string;
	}): Promise<StoreAction<UserEntity>> {
		this.#log.debug({ userId: user.id }, 'inserting user');

		const cmd = userEntity.build(PutItemCommand).item({
			...user,
			status: 'pending'
		});

		await cmd.send();

		return await this.getUserByEmail(user.email);
	}

	/**
	 * Retrieves a user entity based on the provided email address.
	 * This method performs a database query to fetch a user by their email.
	 */
	async getUserByEmail(email: string): Promise<StoreAction<UserEntity>> {
		this.#log.debug('getting user by email');

		const cmd = userEntity.build(GetItemCommand).key({
			email: email
		});

		const output = await cmd.send();

		if (!output.Item || !output.Item.id) {
			return {
				error: new ItemNotFoundError(email, email)
			};
		}

		return {
			data: output.Item
		};
	}
}
