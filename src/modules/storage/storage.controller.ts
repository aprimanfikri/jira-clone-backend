import type { Context } from "hono";
import responseHandler from "@/helpers/response";
import storageService from "@/modules/storage/storage.service";
import { RESPONSE_CODES } from "@/types";
import {
	type GeneratePresignedUrlSchema,
	generatePresignedUrlSchema,
} from "./storage.validation";

class StorageController {
	private static _instance: StorageController;
	private readonly storageService: typeof storageService;

	private constructor() {
		this.storageService = storageService;
	}

	static get instance() {
		if (!StorageController._instance) {
			StorageController._instance = new StorageController();
		}
		return StorageController._instance;
	}

	async generatePresignedUrl(c: Context) {
		const body = await c.req.json<GeneratePresignedUrlSchema>();
		const data = generatePresignedUrlSchema.parse(body);

		const result = await this.storageService.generateUploadSign(
			data.fileName,
			data.contentType,
			data.folder,
		);

		return responseHandler.success(
			c,
			"Presigned URL generated successfully",
			result,
			RESPONSE_CODES.SUCCESS,
			200,
		);
	}
}

const storageController = StorageController.instance;
export default storageController;
