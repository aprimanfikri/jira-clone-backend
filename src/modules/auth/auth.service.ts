import { HTTPException } from "hono/http-exception";
import type { User } from "@/database/schemas";
import bcryptHelper from "@/helpers/bcrypt";
import authRepository from "@/modules/auth/auth.repository";
import type { AuthLoginSchema } from "@/modules/auth/auth.validation";
import { omitPassword } from "@/utils";

class AuthService {
	private static _instance: AuthService;
	private readonly authRepository: typeof authRepository;
	private readonly bcryptHelper: typeof bcryptHelper;

	private constructor() {
		this.authRepository = authRepository;
		this.bcryptHelper = bcryptHelper;
	}

	static get instance() {
		if (!AuthService._instance) {
			AuthService._instance = new AuthService();
		}
		return AuthService._instance;
	}

	async login(body: AuthLoginSchema): Promise<Omit<User, "password">> {
		const user = await this.authRepository.findByEmail(body.email);
		if (!user) {
			throw new HTTPException(401, { message: "Invalid credentials" });
		}
		if (!user.isEmailVerified) {
			throw new HTTPException(401, {
				message: "Email is not verified",
			});
		}
		if (!user.password) {
			throw new HTTPException(401, {
				message:
					"This account was created via Google and has no password. Please use 'Forgot Password' to set one.",
			});
		}
		const isPasswordValid = await this.bcryptHelper.compare(
			body.password,
			user.password,
		);
		if (!isPasswordValid) {
			throw new HTTPException(401, { message: "Invalid credentials" });
		}
		return omitPassword(user);
	}
}

const authService = AuthService.instance;
export default authService;
