import { z } from "zod";

export const createIssueSchema = z.object({
	title: z.string().min(1).max(255),
	description: z.string().optional(),
	type: z.enum(["TASK", "BUG", "STORY", "EPIC"]).default("TASK"),
	priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
	assigneeId: z.string().optional(),
});

export const updateIssueSchema = z.object({
	title: z.string().min(1).max(255).optional(),
	description: z.string().optional(),
	type: z.enum(["TASK", "BUG", "STORY", "EPIC"]).optional(),
	status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
	priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
	assigneeId: z.string().nullable().optional(),
	order: z.number().int().optional(),
});

export const reorderIssueSchema = z.object({
	status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
	order: z.number().int(),
});

export type CreateIssueSchema = z.infer<typeof createIssueSchema>;
export type UpdateIssueSchema = z.infer<typeof updateIssueSchema>;
export type ReorderIssueSchema = z.infer<typeof reorderIssueSchema>;
