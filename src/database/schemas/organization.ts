import { cuid2 as cuid } from "drizzle-cuid2/postgres";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { organizationMembers } from "@/database/schemas/organization-member";
import { users } from "@/database/schemas/user";

export const organizations = pgTable("organizations", {
	id: cuid("id").defaultRandom().primaryKey(),
	name: varchar("name", { length: 100 }).notNull(),
	slug: varchar("slug", { length: 100 }).notNull().unique(),
	logo: text("logo"),
	ownerId: cuid("owner_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const organizationsRelations = relations(
	organizations,
	({ one, many }) => ({
		owner: one(users, {
			fields: [organizations.ownerId],
			references: [users.id],
		}),
		members: many(organizationMembers),
	}),
);

export type Organization = typeof organizations.$inferSelect;
export type OrganizationCreateInput = typeof organizations.$inferInsert;
export type OrganizationUpdateInput = Partial<OrganizationCreateInput>;
