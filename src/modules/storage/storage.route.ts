import { Hono } from "hono";
import authMiddleware from "@/middlewares/auth.middleware";
import storageController from "./storage.controller";

const storageRoute = new Hono();

storageRoute.post("/presigned-url", authMiddleware.session(), (c) =>
	storageController.generatePresignedUrl(c),
);

export default storageRoute;
