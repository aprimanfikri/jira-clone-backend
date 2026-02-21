import { z } from "@hono/zod-openapi";
import { requiredString } from "@/utils";

export const authLoginSchema = z.object({
	email: z.email("Invalid email").openapi({ example: "user@example.com" }),
	password: requiredString("Password")
		.min(6, "Password must be at least 6 characters long")
		.max(32, "Password must be at most 32 characters long")
		.openapi({ example: "password123" }),
});

export type AuthLoginSchema = z.infer<typeof authLoginSchema>;
