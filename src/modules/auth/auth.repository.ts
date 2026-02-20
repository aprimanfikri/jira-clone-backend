import { eq } from "drizzle-orm";
import database from "@/database/client";
import {
	type User,
	type UserCreateInput,
	type UserUpdateInput,
	users,
} from "@/database/schemas";

class AuthRepository {
	private static _instance: AuthRepository;
	private readonly db: typeof database;

	private constructor() {
		this.db = database;
	}

	static get instance() {
		if (!AuthRepository._instance) {
			AuthRepository._instance = new AuthRepository();
		}
		return AuthRepository._instance;
	}

	async findById(id: string): Promise<User | null> {
		const user = await this.db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, id),
		});
		return user ?? null;
	}

	async findByEmail(email: string): Promise<User | null> {
		const user = await this.db.query.users.findFirst({
			where: (users, { eq }) => eq(users.email, email),
		});
		return user ?? null;
	}

	async findByGoogleId(googleId: string): Promise<User | null> {
		const user = await this.db.query.users.findFirst({
			where: (users, { eq }) => eq(users.googleId, googleId),
		});
		return user ?? null;
	}

	async create(data: UserCreateInput): Promise<User> {
		const [user] = await this.db.insert(users).values(data).returning();
		return user;
	}

	async update(id: string, data: UserUpdateInput): Promise<User> {
		const [user] = await this.db
			.update(users)
			.set(data)
			.where(eq(users.id, id))
			.returning();
		return user;
	}
}

const authRepository = AuthRepository.instance;
export default authRepository;
