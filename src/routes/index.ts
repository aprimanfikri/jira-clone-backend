import { Hono } from "hono";
import authRoute from "@/modules/auth/auth.route";
import organizationRoutes from "@/modules/organization/organization.routes";
import storageRoute from "@/modules/storage/storage.route";

const routes = new Hono();

routes.route("/auth", authRoute);
routes.route("/organizations", organizationRoutes);
routes.route("/storage", storageRoute);

export default routes;
