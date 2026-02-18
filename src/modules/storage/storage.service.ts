import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/config/env";

class StorageService {
	private static _instance: StorageService;
	private readonly s3Client: S3Client;
	private readonly bucketName: string;
	private readonly publicUrl: string;

	private constructor() {
		this.bucketName = env.R2_BUCKET_NAME;
		this.publicUrl = env.R2_PUBLIC_URL.replace(/\/$/, "");

		this.s3Client = new S3Client({
			region: "auto",
			endpoint: env.R2_ENDPOINT,
			credentials: {
				accessKeyId: env.R2_ACCESS_KEY_ID,
				secretAccessKey: env.R2_SECRET_ACCESS_KEY,
			},
		});
	}

	static get instance() {
		if (!StorageService._instance) {
			StorageService._instance = new StorageService();
		}
		return StorageService._instance;
	}

	private extractKey(url: string): string {
		return url.replace(`${this.publicUrl}/`, "");
	}

	async deleteFile(fileUrl: string | null | undefined) {
		if (!fileUrl || !fileUrl.startsWith(this.publicUrl)) return;

		try {
			const key = this.extractKey(fileUrl);
			const command = new DeleteObjectCommand({
				Bucket: this.bucketName,
				Key: key,
			});

			await this.s3Client.send(command);
			console.log(`[R2] Deleted successfully: ${key}`);
		} catch (error) {
			console.error("[R2] Delete Error:", error);
		}
	}

	async generateUploadSign(
		fileName: string,
		contentType: string,
		folder: string,
	) {
		const slugName = fileName
			.replace(/\.[^/.]+$/, "")
			.replace(/\s+/g, "-")
			.toLowerCase();
		const extension = fileName.split(".").pop();
		const uniqueId = crypto.randomUUID();
		const key = `jera/${folder}/${slugName}-${uniqueId}.${extension}`;

		const command = new PutObjectCommand({
			Bucket: this.bucketName,
			Key: key,
			ContentType: contentType,
			Metadata: {
				"original-name": fileName,
			},
		});

		const signedUrl = await getSignedUrl(this.s3Client, command, {
			expiresIn: 3600,
		});

		return {
			signedUrl,
			fileUrl: `${this.publicUrl}/${key}`,
			key,
		};
	}
}

const storageService = StorageService.instance;
export default storageService;
