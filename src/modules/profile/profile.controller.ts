import type { Context } from "hono";
import type { Session } from "hono-sessions";
import responseHandler from "@/helpers/response";
import profileService from "@/modules/profile/profile.service";
import {
	type UpdateProfilePasswordSchema,
	type UpdateProfileSchema,
	updateProfilePasswordSchema,
	updateProfileSchema,
} from "@/modules/profile/profile.validation";
import { RESPONSE_CODES, type SessionData } from "@/types";

class ProfileController {
	private static _instance: ProfileController;
	private readonly profileService: typeof profileService;
	private readonly responseHandler: typeof responseHandler;

	private constructor() {
		this.profileService = profileService;
		this.responseHandler = responseHandler;
	}

	static get instance() {
		if (!ProfileController._instance) {
			ProfileController._instance = new ProfileController();
		}
		return ProfileController._instance;
	}

	getProfile = async (c: Context) => {
		const user = c.get("auth") as SessionData["user"];
		const profile = await this.profileService.getProfile(user.id);
		return this.responseHandler.success(
			c,
			"User profile retrieved successfully",
			profile,
			RESPONSE_CODES.SUCCESS,
			200,
		);
	};

	updateProfile = async (c: Context) => {
		const user = c.get("auth") as SessionData["user"];
		const body = await c.req.json<UpdateProfileSchema>();
		const validatedData = updateProfileSchema.parse(body);
		const updatedUser = await this.profileService.updateProfile(
			user.id,
			validatedData,
		);

		// Update session
		const session = c.get("session") as Session<SessionData>;
		session.set("user", updatedUser);

		return this.responseHandler.success(
			c,
			"Profile updated successfully",
			updatedUser,
			RESPONSE_CODES.SUCCESS,
			200,
		);
	};

	updatePassword = async (c: Context) => {
		const user = c.get("auth") as SessionData["user"];
		const body = await c.req.json<UpdateProfilePasswordSchema>();
		const validatedData = updateProfilePasswordSchema.parse(body);
		await this.profileService.updatePassword(user.id, validatedData);
		return this.responseHandler.success(
			c,
			"Password updated successfully",
			undefined,
			RESPONSE_CODES.SUCCESS,
			200,
		);
	};
}

const profileController = ProfileController.instance;
export default profileController;
