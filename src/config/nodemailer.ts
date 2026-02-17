import { createTransport } from "nodemailer";
import { env } from "@/config/env";

export const transporter = createTransport({
	service: "gmail",
	auth: {
		user: env.GOOGLE_APP_EMAIL,
		pass: env.GOOGLE_APP_PASSWORD,
	},
});
