import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1),
  parentId: z.string().nullable().optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1),
});

export type CreateCommentSchema = z.infer<typeof createCommentSchema>;
export type UpdateCommentSchema = z.infer<typeof updateCommentSchema>;
