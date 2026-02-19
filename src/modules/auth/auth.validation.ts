import { z } from "@hono/zod-openapi";
import { requiredString } from "@/utils";

export const authLoginSchema = z.object({
	email: z.email("Invalid email").openapi({ example: "user@example.com" }),
	password: requiredString("Password")
		.min(6, "Password must be at least 6 characters long")
		.max(32, "Password must be at most 32 characters long")
		.openapi({ example: "password123" }),
});

export const authRegisterSchema = z.object({
	name: requiredString("Name")
		.min(3, "Name must be at least 3 characters long")
		.max(32, "Name must be at most 32 characters long")
		.openapi({ example: "John Doe" }),
	email: z.email("Invalid email").openapi({ example: "user@example.com" }),
	password: requiredString("Password")
		.min(6, "Password must be at least 6 characters long")
		.max(32, "Password must be at most 32 characters long")
		.openapi({ example: "password123" }),
	invitationToken: z.string().optional().openapi({ example: "inv_123" }),
});

export const forgotPasswordSchema = authLoginSchema.omit({ password: true });
export const resendVerificationSchema = authLoginSchema.omit({
	password: true,
});

export const resetPasswordSchema = z
	.object({
		password: requiredString("Password")
			.min(6, "Password must be at least 6 characters long")
			.max(32, "Password must be at most 32 characters long")
			.openapi({ example: "newpassword123" }),
		confirmPassword: requiredString("Confirm Password")
			.min(6, "Confirm Password must be at least 6 characters long")
			.max(32, "Confirm Password must be at most 32 characters long")
			.openapi({ example: "newpassword123" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type AuthLoginSchema = z.infer<typeof authLoginSchema>;
export type AuthRegisterSchema = z.infer<typeof authRegisterSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResendVerificationSchema = z.infer<typeof resendVerificationSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
