import { cuid2 as cuid } from "drizzle-cuid2/postgres";
import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "@/database/schemas/user";

export const projects = pgTable("projects", {
  id: cuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  key: varchar("key", { length: 10 }).notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  leadId: cuid("lead_id").references(() => users.id, { onDelete: "set null" }),
  issueCount: integer("issue_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type ProjectCreateInput = typeof projects.$inferInsert;
export type ProjectUpdateInput = Partial<ProjectCreateInput>;
