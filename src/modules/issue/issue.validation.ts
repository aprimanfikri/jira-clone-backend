import { z } from "zod";

export const createIssueSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(["TASK", "BUG", "STORY", "EPIC", "SUBTASK"]).default("TASK"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  assigneeId: z.string().optional(),
  parentId: z.string().nullable().optional(),
  epicId: z.string().nullable().optional(),
});

export const updateIssueSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  type: z.enum(["TASK", "BUG", "STORY", "EPIC", "SUBTASK"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  assigneeId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  epicId: z.string().nullable().optional(),
  order: z.number().optional(),
});

export const reorderIssueSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
  order: z.number().int(),
});

export const batchReorderSchema = z.object({
  issueIds: z.array(z.string()),
});

export type CreateIssueSchema = z.infer<typeof createIssueSchema>;
export type UpdateIssueSchema = z.infer<typeof updateIssueSchema>;
export type ReorderIssueSchema = z.infer<typeof reorderIssueSchema>;
export type BatchReorderSchema = z.infer<typeof batchReorderSchema>;
