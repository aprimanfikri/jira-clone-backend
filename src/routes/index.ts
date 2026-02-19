import { OpenAPIHono } from "@hono/zod-openapi";
import authRoute from "@/modules/auth/auth.route";
import organizationRoutes from "@/modules/organization/organization.routes";
import profileRoute from "@/modules/profile/profile.route";
import storageRoute from "@/modules/storage/storage.route";

const routes = new OpenAPIHono();

routes.route("/auth", authRoute);
routes.route("/organizations", organizationRoutes);
routes.route("/storage", storageRoute);
routes.route("/profile", profileRoute);

export default routes;
