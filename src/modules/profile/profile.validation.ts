import { z } from "@hono/zod-openapi";
import { requiredString } from "@/utils";

export const updateProfileSchema = z.object({
	name: requiredString("Name")
		.min(3, "Name must be at least 3 characters long")
		.max(100, "Name must be at most 100 characters long")
		.openapi({ example: "John Doe" }),
	image: z
		.string()
		.optional()
		.openapi({ example: "https://example.com/avatar.png" }),
});

export const updateProfilePasswordSchema = z
	.object({
		password: requiredString("Password")
			.min(6, "Password must be at least 6 characters long")
			.max(100, "Password must be at most 100 characters long")
			.openapi({ example: "currentpassword" }),
		newPassword: requiredString("New Password")
			.min(6, "New Password must be at least 6 characters long")
			.max(100, "New Password must be at most 100 characters long")
			.openapi({ example: "newpassword123" }),
		newConfirmPassword: requiredString("New Confirm Password")
			.min(6, "New Confirm Password must be at least 6 characters long")
			.max(100, "New Confirm Password must be at most 100 characters long")
			.openapi({ example: "newpassword123" }),
	})
	.refine((data) => data.newPassword === data.newConfirmPassword, {
		message: "Passwords do not match",
		path: ["newConfirmPassword"],
	})
	.refine((data) => data.password !== data.newPassword, {
		message: "New Password must be different from current password",
		path: ["newPassword"],
	});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
export type UpdateProfilePasswordSchema = z.infer<
	typeof updateProfilePasswordSchema
>;
