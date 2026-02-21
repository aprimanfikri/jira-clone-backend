import type { Context } from "hono";
import type { Session } from "hono-sessions";
import responseHandler from "@/helpers/response";
import authService from "@/modules/auth/auth.service";
import {
	type AuthLoginSchema,
	authLoginSchema,
} from "@/modules/auth/auth.validation";
import { RESPONSE_CODES, type SessionData } from "@/types";

class AuthController {
	private static _instance: AuthController;
	private readonly authService: typeof authService;
	private readonly responseHandler: typeof responseHandler;

	private constructor() {
		this.authService = authService;
		this.responseHandler = responseHandler;
	}

	static get instance() {
		if (!AuthController._instance) {
			AuthController._instance = new AuthController();
		}
		return AuthController._instance;
	}

	login = async (c: Context) => {
		const body = await c.req.json<AuthLoginSchema>();
		const data = authLoginSchema.parse(body);
		const result = await this.authService.login(data);
		const session = c.get("session") as Session<SessionData>;
		session.set("user", result);
		return this.responseHandler.success(
			c,
			"Login successfully",
			undefined,
			RESPONSE_CODES.SUCCESS,
			200,
		);
	};

	logout = async (c: Context) => {
		const session = c.get("session") as Session<SessionData>;
		session.deleteSession();
		return this.responseHandler.success(
			c,
			"Logout successfully",
			undefined,
			RESPONSE_CODES.SUCCESS,
			200,
		);
	};

	me = async (c: Context) => {
		const session = c.get("session") as Session<SessionData>;
		const user = session.get("user");
		if (!user) {
			return this.responseHandler.error(
				c,
				"Unauthorized",
				RESPONSE_CODES.UNAUTHORIZED,
				401,
			);
		}
		return this.responseHandler.success(
			c,
			"User profile",
			user,
			RESPONSE_CODES.SUCCESS,
			200,
		);
	};
}

const authController = AuthController.instance;
export default authController;
