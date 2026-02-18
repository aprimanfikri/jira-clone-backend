import path from "node:path";
import { HTTPException } from "hono/http-exception";
import { env } from "@/config/env";

type EmailType =
	| "verify"
	| "verified"
	| "reset-password"
	| "reset-success"
	| "invitation";

interface EmailMessage {
	subject: string;
	html: string;
}

export async function generateEmailMessage(
	type: EmailType,
	token?: string,
	link?: string,
): Promise<EmailMessage> {
	const templatesDir = path.join(import.meta.dir, "../templates");

	const readTemplate = async (filename: string) => {
		const filePath = path.join(templatesDir, filename);
		const file = Bun.file(filePath);
		return await file.text();
	};

	let subject = "";
	let html = "";
	let actionUrl = link || "";

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

		case "invitation":
			if (!token && !link)
				throw new HTTPException(400, {
					message: "Token or Link is required for invitation email",
				});
			subject = "You've been invited to join an organization";
			html = await readTemplate("invitation.html");
			if (!actionUrl) {
				actionUrl = `${env.FRONTEND_BASE_URL}/invitations/accept?token=${token}`;
			}
			break;

		default:
			throw new Error("Invalid email type");
	}

	html = html
		.replaceAll("{{FRONTEND_BASE_URL}}", env.FRONTEND_BASE_URL)
		.replaceAll("{{TOKEN}}", token || "")
		.replaceAll("{{ACTION_URL}}", actionUrl);

	return { subject, html };
}
