import { Hono } from "hono";
import authMiddleware from "@/middlewares/auth.middleware";
import projectController from "./project.controller";

const projectRoutes = new Hono();

projectRoutes.use("*", authMiddleware.session());

// GET /organizations/:orgId/projects
projectRoutes.get("/", projectController.getAll);

// POST /organizations/:orgId/projects
projectRoutes.post("/", projectController.create);

// GET /projects/key/:key
projectRoutes.get("/key/:key", projectController.getDetailByKey);

// GET /organizations/:orgId/projects/:projectId
projectRoutes.get("/:projectId", projectController.getDetail);

// PATCH /organizations/:orgId/projects/:projectId
projectRoutes.patch("/:projectId", projectController.update);

// DELETE /organizations/:orgId/projects/:projectId
projectRoutes.delete("/:projectId", projectController.delete);

export default projectRoutes;
