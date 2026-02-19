import { eq } from "drizzle-orm";
import database from "@/database/client";
import { type User, type UserUpdateInput, users } from "@/database/schemas";

class ProfileRepository {
	private static _instance: ProfileRepository;
	private readonly db: typeof database;

	private constructor() {
		this.db = database;
	}

	static get instance() {
		if (!ProfileRepository._instance) {
			ProfileRepository._instance = new ProfileRepository();
		}
		return ProfileRepository._instance;
	}

	async findById(id: string): Promise<User | null> {
		const user = await this.db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, id),
		});
		return user ?? null;
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

const profileRepository = ProfileRepository.instance;
export default profileRepository;
