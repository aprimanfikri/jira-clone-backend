import path from "node:path";
import { HTTPException } from "hono/http-exception";
import { env } from "@/config/env";

type EmailType = "verify" | "verified" | "reset-password" | "reset-success";

interface EmailMessage {
	subject: string;
	html: string;
}

export async function generateEmailMessage(
	type: EmailType,
	token?: string,
): Promise<EmailMessage> {
	const templatesDir = path.join(import.meta.dir, "../templates");

	const readTemplate = async (filename: string) => {
		const filePath = path.join(templatesDir, filename);
		const file = Bun.file(filePath);
		return await file.text();
	};

	let subject = "";
	let html = "";

	switch (type) {
		case "verify":
			if (!token)
				throw new HTTPException(400, {
					message: "Token is required for verification email",
				});
			subject = "Verify Your Account";
			html = await readTemplate("verify.html");
			break;

		case "verified":
			subject = "Your Account Has Been Verified";
			html = await readTemplate("verified.html");
			break;

		case "reset-password":
			if (!token)
				throw new HTTPException(400, {
					message: "Token is required for reset password email",
				});
			subject = "Reset Your Password";
			html = await readTemplate("reset-password.html");
			break;

		case "reset-success":
			subject = "Your Password Has Been Changed";
			html = await readTemplate("reset-success.html");
			break;

		default:
			throw new Error("Invalid email type");
	}

	html = html
		.replaceAll("{{FRONTEND_BASE_URL}}", env.FRONTEND_BASE_URL)
		.replaceAll("{{TOKEN}}", token || "");

	return { subject, html };
}
