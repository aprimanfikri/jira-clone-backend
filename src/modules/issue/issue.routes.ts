import { Hono } from "hono";
import authMiddleware from "@/middlewares/auth.middleware";
import issueController from "./issue.controller";

const issueRoutes = new Hono();

issueRoutes.use("*", authMiddleware.session());

// GET /projects/:projectId/issues
issueRoutes.get("/", issueController.getAll);

// POST /projects/:projectId/issues
issueRoutes.post("/", issueController.create);

// GET /projects/:projectId/issues/:issueId
issueRoutes.get("/:issueId", issueController.getDetail);

// PATCH /projects/:projectId/issues/:issueId
issueRoutes.patch("/:issueId", issueController.update);

// DELETE /projects/:projectId/issues/:issueId
issueRoutes.delete("/:issueId", issueController.delete);

export default issueRoutes;
