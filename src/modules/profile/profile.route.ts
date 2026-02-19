import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import authMiddleware from "@/middlewares/auth.middleware";
import profileController from "@/modules/profile/profile.controller";
import {
	updateProfilePasswordSchema,
	updateProfileSchema,
} from "./profile.validation";

const profileRoute = new OpenAPIHono();

const tags = ["Profile"];

profileRoute.use("*", authMiddleware.session());

const getProfileRoute = createRoute({
	method: "get",
	path: "/",
	tags,
	security: [{ cookieAuth: [] }],
	responses: { 200: { description: "Get current user profile" } },
});
profileRoute.openapi(getProfileRoute, profileController.getProfile);

const updateProfileRoute = createRoute({
	method: "patch",
	path: "/",
	tags,
	security: [{ cookieAuth: [] }],
	request: {
		body: { content: { "application/json": { schema: updateProfileSchema } } },
	},
	responses: { 200: { description: "Profile updated" } },
});
profileRoute.openapi(updateProfileRoute, profileController.updateProfile);

const updatePasswordRoute = createRoute({
	method: "patch",
	path: "/password",
	tags,
	security: [{ cookieAuth: [] }],
	request: {
		body: {
			content: { "application/json": { schema: updateProfilePasswordSchema } },
		},
	},
	responses: { 200: { description: "Password updated" } },
});
profileRoute.openapi(updatePasswordRoute, profileController.updatePassword);

export default profileRoute;
