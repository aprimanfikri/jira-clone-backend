import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Session } from "hono-sessions";
import type { SessionData } from "@/types";

class AuthMiddleware {
	private static _instance: AuthMiddleware;

	private constructor() {}

	static get instance() {
		if (!AuthMiddleware._instance) {
			AuthMiddleware._instance = new AuthMiddleware();
		}
		return AuthMiddleware._instance;
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
