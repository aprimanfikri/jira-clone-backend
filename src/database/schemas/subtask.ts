import { cuid2 as cuid } from "drizzle-cuid2/postgres";
import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { issues } from "@/database/schemas/issue";
import { users } from "@/database/schemas/user";
import { issueStatusEnum, issuePriorityEnum } from "@/database/schemas/issue";

export const subtasks = pgTable("subtasks", {
  id: cuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  key: varchar("key", { length: 20 }).notNull().unique(),
  description: text("description"),
  status: issueStatusEnum("status").notNull().default("TODO"),
  priority: issuePriorityEnum("priority").notNull().default("MEDIUM"),
  order: integer("order").notNull().default(0),
  issueId: cuid("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  assigneeId: cuid("assignee_id").references(() => users.id, {
    onDelete: "set null",
  }),
  reporterId: cuid("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Subtask = typeof subtasks.$inferSelect;
export type SubtaskCreateInput = typeof subtasks.$inferInsert;
export type SubtaskUpdateInput = Partial<SubtaskCreateInput>;
