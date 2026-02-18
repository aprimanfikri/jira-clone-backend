import type { AppEnv } from "@/types";
import { requiredEnv } from "@/utils";

const rawAppEnv = requiredEnv("APP_ENV");
const validEnvs: AppEnv[] = ["development", "staging", "production", "test"];

if (!validEnvs.includes(rawAppEnv as AppEnv)) {
	console.error(
		`Invalid APP_ENV: ${rawAppEnv}. Must be one of ${validEnvs.join(", ")}`,
	);
	process.exit(1);
}

export const env = {
	DATABASE_URL: requiredEnv("DATABASE_URL"),
	SESSION_SECRET: requiredEnv("SESSION_SECRET"),
	JWT_SECRET: requiredEnv("JWT_SECRET"),
	GOOGLE_APP_EMAIL: requiredEnv("GOOGLE_APP_EMAIL"),
	GOOGLE_APP_PASSWORD: requiredEnv("GOOGLE_APP_PASSWORD"),
	PORT: Number(Bun.env.PORT ?? 4001),
	APP_ENV: rawAppEnv as AppEnv,
	FRONTEND_BASE_URL: requiredEnv("FRONTEND_BASE_URL"),
	CORS_ORIGIN:
		requiredEnv("CORS_ORIGIN")
			?.split(",")
			.map((o) => o.trim())
			.filter(Boolean) ?? [],
	RESEND_API_KEY: requiredEnv("RESEND_API_KEY"),
	RESEND_EMAIL: requiredEnv("RESEND_EMAIL"),
	R2_ENDPOINT: requiredEnv("R2_ENDPOINT"),
	R2_ACCESS_KEY_ID: requiredEnv("R2_ACCESS_KEY_ID"),
	R2_SECRET_ACCESS_KEY: requiredEnv("R2_SECRET_ACCESS_KEY"),
	R2_BUCKET_NAME: requiredEnv("R2_BUCKET_NAME"),
	R2_PUBLIC_URL: requiredEnv("R2_PUBLIC_URL"),
};
