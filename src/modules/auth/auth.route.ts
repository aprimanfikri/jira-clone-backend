import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import authMiddleware from "@/middlewares/auth.middleware";
import authController from "./auth.controller";
import { authLoginSchema } from "./auth.validation";

const authRoute = new OpenAPIHono();

const tags = ["Auth"];

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

const logoutRoute = createRoute({
	method: "post",
	path: "/logout",
	tags,
	responses: {
		200: { description: "Logout successful" },
	},
});

authRoute.openapi(logoutRoute, authController.logout);

export default authRoute;
