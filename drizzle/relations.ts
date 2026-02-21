import { relations } from "drizzle-orm/relations";
import { users, projects, issues, subtasks } from "./schema";

export const projectsRelations = relations(projects, ({one, many}) => ({
	user: one(users, {
		fields: [projects.leadId],
		references: [users.id]
	}),
	issues: many(issues),
}));

export const usersRelations = relations(users, ({many}) => ({
	projects: many(projects),
	issues_assigneeId: many(issues, {
		relationName: "issues_assigneeId_users_id"
	}),
	issues_reporterId: many(issues, {
		relationName: "issues_reporterId_users_id"
	}),
	subtasks_assigneeId: many(subtasks, {
		relationName: "subtasks_assigneeId_users_id"
	}),
	subtasks_reporterId: many(subtasks, {
		relationName: "subtasks_reporterId_users_id"
	}),
}));

export const issuesRelations = relations(issues, ({one, many}) => ({
	project: one(projects, {
		fields: [issues.projectId],
		references: [projects.id]
	}),
	user_assigneeId: one(users, {
		fields: [issues.assigneeId],
		references: [users.id],
		relationName: "issues_assigneeId_users_id"
	}),
	user_reporterId: one(users, {
		fields: [issues.reporterId],
		references: [users.id],
		relationName: "issues_reporterId_users_id"
	}),
	subtasks: many(subtasks),
}));

export const subtasksRelations = relations(subtasks, ({one}) => ({
	issue: one(issues, {
		fields: [subtasks.issueId],
		references: [issues.id]
	}),
	user_assigneeId: one(users, {
		fields: [subtasks.assigneeId],
		references: [users.id],
		relationName: "subtasks_assigneeId_users_id"
	}),
	user_reporterId: one(users, {
		fields: [subtasks.reporterId],
		references: [users.id],
		relationName: "subtasks_reporterId_users_id"
	}),
}));