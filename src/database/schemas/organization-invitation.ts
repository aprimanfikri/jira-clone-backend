import { cuid2 as cuid } from "drizzle-cuid2/postgres";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { organizations } from "@/database/schemas/organization";
import { organizationMemberRoleEnum } from "@/database/schemas/organization-member";

export const organizationInvitations = pgTable("organization_invitations", {
	id: cuid("id").defaultRandom().primaryKey(),
	organizationId: cuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	email: varchar("email", { length: 255 }).notNull(),
	role: organizationMemberRoleEnum("role").notNull(),
	token: text("token").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OrganizationInvitation =
	typeof organizationInvitations.$inferSelect;
export type OrganizationInvitationCreateInput =
	typeof organizationInvitations.$inferInsert;
