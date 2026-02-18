import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Session } from "hono-sessions";
import tokenHelper from "@/helpers/token";
import authRepository from "@/modules/auth/auth.repository";
import type { PurposeType, SessionData } from "@/types";

class AuthMiddleware {
	private static _instance: AuthMiddleware;
	private readonly tokenHelper: typeof tokenHelper;
	private readonly userRepository: typeof authRepository;

	private constructor() {
		this.tokenHelper = tokenHelper;
		this.userRepository = authRepository;
	}

	static get instance() {
		if (!AuthMiddleware._instance) {
			AuthMiddleware._instance = new AuthMiddleware();
		}
		return AuthMiddleware._instance;
	}

	token(requiredPurpose?: PurposeType) {
		return async (c: Context, next: Next) => {
			const header = c.req.header("Authorization");
			if (!header || !header.startsWith("Bearer ")) {
				throw new HTTPException(401, {
					message: "Missing or invalid authorization header",
				});
			}
			const token = header.split(" ")[1];
			const payload = await this.tokenHelper.verify(token);
			const user = await this.userRepository.findById(payload.id);
			if (!user) {
				throw new HTTPException(401, {
					message: "Invalid token",
				});
			}
			if (requiredPurpose && payload.purpose !== requiredPurpose) {
				throw new HTTPException(403, {
					message: "Forbidden: invalid token purpose",
				});
			}
			c.set("auth", payload);
			await next();
		};
	}

	session() {
		return async (c: Context, next: Next) => {
			const session = c.get("session") as Session<SessionData>;
			const sessionUser = session?.get("user");
			if (!sessionUser) {
				throw new HTTPException(401, {
					message: "Unauthorized",
				});
			}
			c.set("auth", sessionUser);
			await next();
		};
	}
}

const authMiddleware = AuthMiddleware.instance;
export default authMiddleware;
