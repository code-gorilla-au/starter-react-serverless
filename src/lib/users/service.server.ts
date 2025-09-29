import { logger } from '$lib/logging';
import { UserDBRepo, type UserRepository } from '$lib/users/repository.server';
import { nanoid } from 'nanoid';
import { type UserDto, userSchema } from '$lib/users/types';
import bcrypt from 'bcrypt';
import type { UserEntity } from '$lib/server/database';

export class UsersService {
	#log = logger.child({ service: 'UsersService' });
	#repo: UserRepository;

	constructor(repo: UserRepository) {
		this.#repo = repo;
	}

	async createUser(user: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
	}) {
		const model = await this.#repo.insertUser({
			...user,
			password: await hashPassword(user.password),
			id: nanoid()
		});

		if (model.error) {
			this.#log.error({ error: model.error.message }, 'could not create user');
			throw model.error;
		}

		return userSchema.parse(model.data);
	}

	async verifyUser(email: string, password: string) {
		const user = await this.getUserModel(email);

		if (user.status !== 'active') {
			this.#log.error('user is not active');

			throw new Error('User is not active');
		}

		const passwordMatch = await compareHash(password, user.password);
		if (!passwordMatch) {
			this.#log.error('password hash does not match');

			throw new Error('invalid password');
		}

		return user;
	}

	async getActiveUser(email: string): Promise<UserDto> {
		const user = await this.getUserByEmail(email);
		if (user.status !== 'active') {
			throw new Error('User is not active');
		}

		return user;
	}

	/**
	 * Retrieves a user by their email address.
	 */
	async getUserByEmail(email: string): Promise<UserDto> {
		const model = await this.getUserModel(email);

		return userSchema.parse(model);
	}

	private async getUserModel(email: string): Promise<UserEntity> {
		const model = await this.#repo.getUserByEmail(email);
		if (model.error) {
			this.#log.error({ error: model.error.message }, 'could not get user by email');
			throw model.error;
		}

		if (!model.data) {
			this.#log.error('user not found');
			throw new Error('User not found');
		}

		return model.data;
	}
}

export function userServiceFactory() {
	const repo = new UserDBRepo();
	return new UsersService(repo);
}

async function compareHash(password: string, hash: string): Promise<boolean> {
	return await bcrypt.compare(password, hash);
}

async function hashPassword(password: string): Promise<string> {
	const salt = await bcrypt.genSalt(10);
	return await bcrypt.hash(password, salt);
}
