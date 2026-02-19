import { z } from "@hono/zod-openapi";
import { organizationMemberRoleEnum } from "@/database/schemas";
import { requiredString } from "@/utils";

export const createOrganizationSchema = z.object({
	name: requiredString("Name")
		.min(3, "Name must be at least 3 characters long")
		.max(100, "Name must be at most 100 characters long")
		.openapi({ example: "My Organization" }),
	logo: z
		.url("Invalid logo URL")
		.openapi({ example: "https://example.com/logo.png" }),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export const inviteMemberSchema = z.object({
	email: z
		.email("Invalid email address")
		.openapi({ example: "member@example.com" }),
	role: z
		.enum(organizationMemberRoleEnum.enumValues)
		.default("MEMBER")
		.openapi({ example: "MEMBER" }),
});

export const acceptInvitationSchema = z.object({
	token: requiredString("Token").openapi({ example: "inv_abc123" }),
});

export const updateMemberRoleSchema = z.object({
	role: z
		.enum(organizationMemberRoleEnum.enumValues)
		.openapi({ example: "ADMIN" }),
});

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationSchema = z.infer<typeof updateOrganizationSchema>;
export type InviteMemberSchema = z.infer<typeof inviteMemberSchema>;
export type AcceptInvitationSchema = z.infer<typeof acceptInvitationSchema>;
export type UpdateMemberRoleSchema = z.infer<typeof updateMemberRoleSchema>;
