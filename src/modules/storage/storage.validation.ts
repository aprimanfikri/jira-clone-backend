import { z } from "@hono/zod-openapi";
import { requiredString } from "@/utils";

export const generatePresignedUrlSchema = z.object({
	fileName: requiredString("File name")
		.min(1, "File name is required")
		.openapi({ example: "avatar.png" }),
	contentType: requiredString("Content type")
		.min(1, "Content type is required")
		.openapi({ example: "image/png" }),
	folder: requiredString("Folder")
		.min(1, "Folder is required")
		.openapi({ example: "avatars" }),
});

export type GeneratePresignedUrlSchema = z.infer<
	typeof generatePresignedUrlSchema
>;
