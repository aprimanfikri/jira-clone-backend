import { cuid2 as cuid } from "drizzle-cuid2/postgres";
import { relations } from "drizzle-orm";
import {
	boolean,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { organizations } from "@/database/schemas/organization";
import { organizationMembers } from "@/database/schemas/organization-member";

export const users = pgTable("users", {
	id: cuid("id").defaultRandom().primaryKey(),
	name: varchar("name", { length: 100 }).notNull(),
	email: varchar("email", { length: 100 }).notNull().unique(),
	password: varchar("password", { length: 255 }).notNull(),
	image: text("image"),
	isEmailVerified: boolean("is_email_verified").notNull().default(false),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	ownedOrganizations: many(organizations),
	memberships: many(organizationMembers),
}));

export type User = typeof users.$inferSelect;
export type UserCreateInput = typeof users.$inferInsert;
export type UserUpdateInput = Partial<UserCreateInput>;
