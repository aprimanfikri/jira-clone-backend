import { z } from "zod";
import { requiredString } from "@/utils";

export const generatePresignedUrlSchema = z.object({
	fileName: requiredString("File name").min(1, "File name is required"),
	contentType: requiredString("Content type").min(
		1,
		"Content type is required",
	),
	folder: requiredString("Folder").min(1, "Folder is required"),
});

export type GeneratePresignedUrlSchema = z.infer<
	typeof generatePresignedUrlSchema
>;
