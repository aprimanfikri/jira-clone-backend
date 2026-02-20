import { Hono } from "hono";
import authMiddleware from "@/middlewares/auth.middleware";
import userController from "./user.controller";

const userRoutes = new Hono();

userRoutes.use("*", authMiddleware.session());

userRoutes.get("/", userController.getAll);

export default userRoutes;
