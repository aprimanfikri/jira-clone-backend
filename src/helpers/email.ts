import { Resend } from "resend";
import { env } from "@/config/env";
import { generateEmailMessage } from "@/utils/email";

export const resend = new Resend(env.RESEND_API_KEY);
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
			await resend.emails.send({
				from: `Jera <${env.RESEND_EMAIL}>`,
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

	async sendInvitationEmail(email: string, token: string) {
		const { subject, html } = await generateEmailMessage("invitation", token);
		return await this.sendEmail({ to: email, subject, html });
	}

	async sendinvitationRegisterEmail(email: string, token: string) {
		const link = `${env.FRONTEND_BASE_URL}/register?invitationToken=${token}`;
		const { subject, html } = await generateEmailMessage(
			"invitation",
			undefined,
			link,
		);
		return await this.sendEmail({ to: email, subject, html });
	}
}

export default EmailHelper.instance;
