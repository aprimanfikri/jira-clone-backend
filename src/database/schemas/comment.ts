import { cuid2 as cuid } from "drizzle-cuid2/postgres";
import {
  type AnyPgColumn,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { issues } from "@/database/schemas/issue";
import { users } from "@/database/schemas/user";

export const comments = pgTable("comments", {
  id: cuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  issueId: cuid("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  authorId: cuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  parentId: cuid("parent_id").references((): AnyPgColumn => comments.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type CommentCreateInput = typeof comments.$inferInsert;
export type CommentUpdateInput = Partial<CommentCreateInput>;
