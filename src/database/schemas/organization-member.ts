import { cuid2 as cuid } from "drizzle-cuid2/postgres";
import { relations } from "drizzle-orm";
import { pgEnum, pgTable, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { organizations } from "@/database/schemas/organization";
import { users } from "@/database/schemas/user";

export const organizationMemberRoleEnum = pgEnum("organization_member_role", [
	"OWNER",
	"ADMIN",
	"MEMBER",
]);

export const organizationMemberStatusEnum = pgEnum(
	"organization_member_status",
	["PENDING", "ACCEPTED"],
);

export const organizationMembers = pgTable(
	"organization_members",
	{
		id: cuid("id").defaultRandom().primaryKey(),
		organizationId: cuid("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		userId: cuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		role: organizationMemberRoleEnum("role").notNull(),
		status: organizationMemberStatusEnum("status").default("PENDING").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("org_user_unique").on(table.organizationId, table.userId),
	],
);

export const organizationMembersRelations = relations(
	organizationMembers,
	({ one }) => ({
		organization: one(organizations, {
			fields: [organizationMembers.organizationId],
			references: [organizations.id],
		}),
		user: one(users, {
			fields: [organizationMembers.userId],
			references: [users.id],
		}),
	}),
);

export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type OrganizationMemberCreateInput =
	typeof organizationMembers.$inferInsert;
export type OrganizationMemberUpdateInput =
	Partial<OrganizationMemberCreateInput>;
