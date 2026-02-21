import { pgTable, foreignKey, unique, varchar, text, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const issuePriority = pgEnum("issue_priority", ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
export const issueStatus = pgEnum("issue_status", ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])
export const issueType = pgEnum("issue_type", ['TASK', 'BUG', 'STORY', 'EPIC'])


export const projects = pgTable("projects", {
	id: varchar({ length: 24 }).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	key: varchar({ length: 10 }).notNull(),
	description: text(),
	icon: text(),
	leadId: varchar("lead_id", { length: 24 }),
	issueCount: integer("issue_count").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.leadId],
			foreignColumns: [users.id],
			name: "projects_lead_id_users_id_fk"
		}).onDelete("set null"),
	unique("projects_key_unique").on(table.key),
]);

export const issues = pgTable("issues", {
	id: varchar({ length: 24 }).primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	type: issueType().default('TASK').notNull(),
	status: issueStatus().default('TODO').notNull(),
	priority: issuePriority().default('MEDIUM').notNull(),
	order: integer().default(0).notNull(),
	projectId: varchar("project_id", { length: 24 }).notNull(),
	assigneeId: varchar("assignee_id", { length: 24 }),
	reporterId: varchar("reporter_id", { length: 24 }).notNull(),
	key: varchar({ length: 20 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "issues_project_id_projects_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.assigneeId],
			foreignColumns: [users.id],
			name: "issues_assignee_id_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.reporterId],
			foreignColumns: [users.id],
			name: "issues_reporter_id_users_id_fk"
		}).onDelete("cascade"),
	unique("issues_key_unique").on(table.key),
]);

export const users = pgTable("users", {
	id: varchar({ length: 24 }).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 100 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	image: text(),
	isEmailVerified: boolean("is_email_verified").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const subtasks = pgTable("subtasks", {
	id: varchar({ length: 24 }).primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	status: issueStatus().default('TODO').notNull(),
	priority: issuePriority().default('MEDIUM').notNull(),
	order: integer().default(0).notNull(),
	issueId: varchar("issue_id", { length: 24 }).notNull(),
	assigneeId: varchar("assignee_id", { length: 24 }),
	reporterId: varchar("reporter_id", { length: 24 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.issueId],
			foreignColumns: [issues.id],
			name: "subtasks_issue_id_issues_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.assigneeId],
			foreignColumns: [users.id],
			name: "subtasks_assignee_id_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.reporterId],
			foreignColumns: [users.id],
			name: "subtasks_reporter_id_users_id_fk"
		}).onDelete("cascade"),
]);
