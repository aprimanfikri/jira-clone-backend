import { z } from "zod";
import { organizationMemberRoleEnum } from "@/database/schemas";
import { requiredString } from "@/utils";

export const createOrganizationSchema = z.object({
	name: requiredString("Name")
		.min(3, "Name must be at least 3 characters long")
		.max(100, "Name must be at most 100 characters long"),
	logo: z.url("Invalid logo URL"),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export const inviteMemberSchema = z.object({
	email: z.email("Invalid email address"),
	role: z.enum(organizationMemberRoleEnum.enumValues).default("MEMBER"),
});

export const acceptInvitationSchema = z.object({
	token: requiredString("Token"),
});

export const updateMemberRoleSchema = z.object({
	role: z.enum(organizationMemberRoleEnum.enumValues),
});

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationSchema = z.infer<typeof updateOrganizationSchema>;
export type InviteMemberSchema = z.infer<typeof inviteMemberSchema>;
export type AcceptInvitationSchema = z.infer<typeof acceptInvitationSchema>;
export type UpdateMemberRoleSchema = z.infer<typeof updateMemberRoleSchema>;
