import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import authMiddleware from "@/middlewares/auth.middleware";
import storageController from "./storage.controller";
import { generatePresignedUrlSchema } from "./storage.validation";

const storageRoute = new OpenAPIHono();

const tags = ["Storage"];

const presignedUrlRoute = createRoute({
	method: "post",
	path: "/presigned-url",
	tags,
	security: [{ cookieAuth: [] }],
	request: {
		body: {
			content: { "application/json": { schema: generatePresignedUrlSchema } },
		},
	},
	responses: { 200: { description: "Presigned URL generated" } },
});

storageRoute.use("/presigned-url", authMiddleware.session());
storageRoute.openapi(presignedUrlRoute, (c) =>
	storageController.generatePresignedUrl(c),
);

export default storageRoute;
