import { cuid2 as cuid } from "drizzle-cuid2/postgres";
import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { projects } from "@/database/schemas/project";
import { users } from "@/database/schemas/user";
export const issueTypeEnum = pgEnum("issue_type", [
  "TASK",
  "BUG",
  "STORY",
  "EPIC",
  "SUBTASK",
]);

export const issueStatusEnum = pgEnum("issue_status", [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
]);

export const issuePriorityEnum = pgEnum("issue_priority", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const issues = pgTable("issues", {
  id: cuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: issueTypeEnum("type").notNull().default("TASK"),
  status: issueStatusEnum("status").notNull().default("TODO"),
  priority: issuePriorityEnum("priority").notNull().default("MEDIUM"),
  order: integer("order").notNull().default(0),
  projectId: cuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  assigneeId: cuid("assignee_id").references(() => users.id, {
    onDelete: "set null",
  }),
  reporterId: cuid("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 20 }).notNull().unique(),
  parentId: cuid("parent_id").references((): any => issues.id, {
    onDelete: "cascade",
  }),
  epicId: cuid("epic_id").references((): any => issues.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Issue = typeof issues.$inferSelect;
export type IssueCreateInput = typeof issues.$inferInsert;
export type IssueUpdateInput = Partial<IssueCreateInput>;
