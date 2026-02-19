import { z } from "@hono/zod-openapi";

export const requiredEnv = (name: string): string => {
	const value = Bun.env[name];
	if (!value || value.trim() === "") {
		console.error(`Missing required environment variable: ${name}`);
		process.exit(1);
	}
	return value;
};

export const requiredString = (fieldName: string): z.ZodString => {
	return z.string({ message: `${fieldName} is required` });
};

export const omitPassword = <T extends { password?: string }>(
	user: T,
): Omit<T, "password"> => {
	const { password, ...safe } = user;
	return safe;
};

export const toLowercase = (value: string): string => {
	return value.trim().toLowerCase();
};
