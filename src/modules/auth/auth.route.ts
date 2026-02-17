import { Hono } from "hono";
import authMiddleware from "@/middlewares/auth.middleware";
import authController from "./auth.controller";

const authRoute = new Hono();

authRoute.post("/register", authController.register);
authRoute.post(
	"/verify",
	authMiddleware.token("verification"),
	authController.verify,
);
authRoute.post("/login", authController.login);
authRoute.post("/logout", authController.logout);
authRoute.get("/me", authMiddleware.session(), authController.me);
authRoute.post("/resend-verification", authController.resendVerification);
authRoute.post("/forgot-password", authController.forgotPassword);
authRoute.post("/resend-reset-password", authController.resendResetPassword);
authRoute.post(
	"/reset-password",
	authMiddleware.token("reset-password"),
	authController.resetPassword,
);

export default authRoute;
