import database from "@/database/client";
import type { User } from "@/database/schemas";

class UserRepository {
	private static _instance: UserRepository;
	private readonly database: typeof database;

	private constructor() {
		this.database = database;
	}

	static get instance() {
		if (!UserRepository._instance) {
			UserRepository._instance = new UserRepository();
		}
		return UserRepository._instance;
	}

	async findAll(): Promise<Omit<User, "password">[]> {
		const result = await this.database.query.users.findMany({
			columns: { id: true, name: true, email: true, image: true },
			orderBy: (users, { asc }) => [asc(users.name)],
		});
		return result;
	}
}

const userRepository = UserRepository.instance;
export default userRepository;
