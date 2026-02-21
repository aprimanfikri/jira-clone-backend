import { relations } from "drizzle-orm";
import { issues } from "./issue";
import { subtasks } from "./subtask";
import { projects } from "./project";
import { users } from "./user";

export const issuesRelations = relations(issues, ({ one, many }) => ({
  project: one(projects, {
    fields: [issues.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [issues.assigneeId],
    references: [users.id],
    relationName: "assignee",
  }),
  reporter: one(users, {
    fields: [issues.reporterId],
    references: [users.id],
    relationName: "reporter",
  }),
  subtasks: many(subtasks),
}));

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  issue: one(issues, {
    fields: [subtasks.issueId],
    references: [issues.id],
  }),
  assignee: one(users, {
    fields: [subtasks.assigneeId],
    references: [users.id],
  }),
  reporter: one(users, {
    fields: [subtasks.reporterId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  lead: one(users, {
    fields: [projects.leadId],
    references: [users.id],
  }),
  issues: many(issues),
}));

export const usersRelations = relations(users, ({ many }) => ({
  assignedIssues: many(issues, { relationName: "assignee" }),
  reportedIssues: many(issues, { relationName: "reporter" }),
  assignedSubtasks: many(subtasks),
}));
