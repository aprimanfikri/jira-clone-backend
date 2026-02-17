import { env } from "@/config/env";
import { transporter } from "@/config/nodemailer";
import { generateEmailMessage } from "@/utils/email";

class EmailHelper {
	private static _instance: EmailHelper;

	private constructor() {}

	static get instance() {
		if (!EmailHelper._instance) {
			EmailHelper._instance = new EmailHelper();
		}
		return EmailHelper._instance;
	}

	private async sendEmail(data: {
		to: string;
		subject: string;
		html: string;
		from?: string;
	}) {
		try {
			await transporter.sendMail({
				from: data.from ?? `<${env.GOOGLE_APP_EMAIL}>`,
				to: data.to,
				subject: data.subject,
				html: data.html,
			});

			return true;
		} catch (error) {
			console.error("[Email Error]", error);
			return false;
		}
	}

	async sendVerificationEmail(email: string, token: string) {
		const { subject, html } = await generateEmailMessage("verify", token);
		return await this.sendEmail({ to: email, subject, html });
	}

	async sendVerifiedEmail(email: string) {
		const { subject, html } = await generateEmailMessage("verified");
		return await this.sendEmail({ to: email, subject, html });
	}

	async sendResetPasswordEmail(email: string, token: string) {
		const { subject, html } = await generateEmailMessage(
			"reset-password",
			token,
		);
		return await this.sendEmail({ to: email, subject, html });
	}

	async sendResetSuccessEmail(email: string) {
		const { subject, html } = await generateEmailMessage("reset-success");
		return await this.sendEmail({ to: email, subject, html });
	}
}

export default EmailHelper.instance;
