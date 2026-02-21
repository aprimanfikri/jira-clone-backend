import { z } from "zod";

export const createSubtaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  assigneeId: z.string().optional(),
});

export const updateSubtaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  assigneeId: z.string().nullable().optional(),
  order: z.number().int().optional(),
});

export type CreateSubtaskSchema = z.infer<typeof createSubtaskSchema>;
export type UpdateSubtaskSchema = z.infer<typeof updateSubtaskSchema>;
