import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import authMiddleware from "@/middlewares/auth.middleware";
import authController from "./auth.controller";
import {
	authLoginSchema,
	authRegisterSchema,
	forgotPasswordSchema,
	resendVerificationSchema,
	resetPasswordSchema,
} from "./auth.validation";

const authRoute = new OpenAPIHono();

const tags = ["Auth"];

// --- Routes ---

const meRoute = createRoute({
	method: "get",
	path: "/",
	tags,
	security: [{ cookieAuth: [] }],
	responses: {
		200: { description: "Get current user" },
	},
});

authRoute.use("/", authMiddleware.session());
authRoute.openapi(meRoute, authController.me);

// ---

const registerRoute = createRoute({
	method: "post",
	path: "/register",
	tags,
	request: {
		body: {
			content: { "application/json": { schema: authRegisterSchema } },
		},
	},
	responses: {
		200: { description: "Register successful" },
	},
});

authRoute.openapi(registerRoute, authController.register);

// ---

const verifyRoute = createRoute({
	method: "post",
	path: "/verify",
	tags,
	security: [{ bearerAuth: [] }],
	responses: {
		200: { description: "Email verified" },
	},
});

authRoute.use("/verify", authMiddleware.token("verification"));
authRoute.openapi(verifyRoute, authController.verify);

// ---

const loginRoute = createRoute({
	method: "post",
	path: "/login",
	tags,
	request: {
		body: {
			content: { "application/json": { schema: authLoginSchema } },
		},
	},
	responses: {
		200: { description: "Login successful" },
	},
});

authRoute.openapi(loginRoute, authController.login);

// ---

const logoutRoute = createRoute({
	method: "post",
	path: "/logout",
	tags,
	responses: {
		200: { description: "Logout successful" },
	},
});

authRoute.openapi(logoutRoute, authController.logout);

// ---

const resendVerificationRoute = createRoute({
	method: "post",
	path: "/resend-verification",
	tags,
	request: {
		body: {
			content: { "application/json": { schema: resendVerificationSchema } },
		},
	},
	responses: {
		200: { description: "Verification email resent" },
	},
});

authRoute.openapi(resendVerificationRoute, authController.resendVerification);

// ---

const forgotPasswordRoute = createRoute({
	method: "post",
	path: "/forgot-password",
	tags,
	request: {
		body: {
			content: { "application/json": { schema: forgotPasswordSchema } },
		},
	},
	responses: {
		200: { description: "Forgot password email sent" },
	},
});

authRoute.openapi(forgotPasswordRoute, authController.forgotPassword);

// ---

const resetPasswordRoute = createRoute({
	method: "post",
	path: "/reset-password",
	tags,
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			content: { "application/json": { schema: resetPasswordSchema } },
		},
	},
	responses: {
		200: { description: "Password reset successful" },
	},
});

authRoute.use("/reset-password", authMiddleware.token("reset-password"));
authRoute.openapi(resetPasswordRoute, authController.resetPassword);

export default authRoute;
