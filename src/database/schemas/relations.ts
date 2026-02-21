import { relations } from "drizzle-orm";
import { issues } from "./issue";
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
  parent: one(issues, {
    fields: [issues.parentId],
    references: [issues.id],
    relationName: "parent",
  }),
  children: many(issues, { relationName: "parent" }),
  epic: one(issues, {
    fields: [issues.epicId],
    references: [issues.id],
    relationName: "epic",
  }),
  epicIssues: many(issues, { relationName: "epic" }),
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
}));
