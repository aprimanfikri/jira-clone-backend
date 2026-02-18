import { HTTPException } from "hono/http-exception";
import { sign, verify } from "hono/jwt";
import { env } from "@/config/env";
import type { JwtPayload } from "@/types";

class TokenHelper {
	private static _instance: TokenHelper;

	private constructor() {}

	static get instance() {
		if (!TokenHelper._instance) {
			TokenHelper._instance = new TokenHelper();
		}
		return TokenHelper._instance;
	}

	async generate(payload: JwtPayload): Promise<string> {
		const now = Math.floor(Date.now() / 1000);
		const expForPurpose = now + 60 * 15; // 15m
		const expDefault = now + 60 * 60 * 24; // 1d
		const exp = payload.purpose ? expForPurpose : expDefault;
		const fullPayload: JwtPayload = { ...payload, exp };
		return await sign(fullPayload, env.JWT_SECRET);
	}

	async verify(token: string): Promise<JwtPayload> {
		try {
			const decoded = await verify(token, env.JWT_SECRET, {
				alg: "HS256",
			});
			if (typeof decoded === "string") {
				throw new HTTPException(401, { message: "Invalid token payload" });
			}
			const payload = decoded as unknown as JwtPayload;
			if (
				typeof payload.id !== "string" ||
				typeof payload.email !== "string" ||
				typeof payload.purpose !== "string"
			) {
				throw new HTTPException(401, { message: "Invalid token structure" });
			}
			return payload;
		} catch {
			throw new HTTPException(401, { message: "Invalid or expired token" });
		}
	}
}

const tokenHelper = TokenHelper.instance;
export default tokenHelper;
