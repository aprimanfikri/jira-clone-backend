import { z } from "zod";

export const createProjectSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().optional(),
	icon: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
export type UpdateProjectSchema = z.infer<typeof updateProjectSchema>;
