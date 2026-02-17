import { Hono } from "hono";
import authRoute from "@/modules/auth/auth.route";

const routes = new Hono();

routes.route("/auth", authRoute);

export default routes;
