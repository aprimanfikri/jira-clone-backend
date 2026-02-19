import { HTTPException } from "hono/http-exception";
import type { User } from "@/database/schemas";
import bcryptHelper from "@/helpers/bcrypt";
import profileRepository from "@/modules/profile/profile.repository";
import type {
	UpdateProfilePasswordSchema,
	UpdateProfileSchema,
} from "@/modules/profile/profile.validation";
import { omitPassword } from "@/utils";

class ProfileService {
	private static _instance: ProfileService;
	private readonly profileRepository: typeof profileRepository;
	private readonly bcryptHelper: typeof bcryptHelper;

	private constructor() {
		this.profileRepository = profileRepository;
		this.bcryptHelper = bcryptHelper;
	}

	static get instance() {
		if (!ProfileService._instance) {
			ProfileService._instance = new ProfileService();
		}
		return ProfileService._instance;
	}

	async getProfile(userId: string): Promise<Omit<User, "password">> {
		const user = await this.profileRepository.findById(userId);
		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}
		return omitPassword(user);
	}

	async updateProfile(
		userId: string,
		data: UpdateProfileSchema,
	): Promise<Omit<User, "password">> {
		const user = await this.profileRepository.update(userId, data);
		return omitPassword(user);
	}

	async updatePassword(
		userId: string,
		data: UpdateProfilePasswordSchema,
	): Promise<void> {
		const user = await this.profileRepository.findById(userId);
		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}

		const isPasswordValid = await this.bcryptHelper.compare(
			data.password,
			user.password,
		);
		if (!isPasswordValid) {
			throw new HTTPException(400, { message: "Invalid current password" });
		}

		const hashedPassword = await this.bcryptHelper.hash(data.newPassword);
		await this.profileRepository.update(userId, { password: hashedPassword });
	}
}

const profileService = ProfileService.instance;
export default profileService;
