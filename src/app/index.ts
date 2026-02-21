import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import type { Context } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { CookieStore, sessionMiddleware } from "hono-sessions";
import { env } from "@/config/env";
import responseHandler from "@/helpers/response";
import { errorHandler } from "@/middlewares/error.middleware";
import routes from "@/routes";
import { RESPONSE_CODES } from "@/types";

const app = new OpenAPIHono().basePath("/project-management");

app.use(logger());

const store = new CookieStore();

app.use(
	"*",
	sessionMiddleware({
		store,
		encryptionKey: env.SESSION_SECRET,
		expireAfterSeconds: 60 * 60 * 24 * 7,
		cookieOptions: {
			sameSite: "Lax",
			path: "/",
			httpOnly: true,
			secure: env.APP_ENV === "production",
			domain: env.APP_ENV === "production" ? ".xfrhk.com" : undefined,
		},
	}),
);

app.use(
	cors({
		origin: env.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.use(csrf({ origin: env.CORS_ORIGIN }));
app.use(secureHeaders());

app.doc("/doc", {
	openapi: "3.0.0",
	info: {
		version: "1.0.0",
		title: "Project Management API",
	},
});

app.get(
	"/reference",
	Scalar({
		theme: "kepler",
		url: "/doc",
	}),
);

app.get("/health", (c: Context) =>
	responseHandler.success(
		c,
		"Server is healthy",
		null,
		RESPONSE_CODES.SUCCESS,
		200,
	),
);

app.route("/", routes);

app.onError(errorHandler);

app.notFound((c: Context) =>
	responseHandler.error(c, "Route not found", RESPONSE_CODES.NOT_FOUND, 404),
);

export default app;
