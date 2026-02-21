import { Hono } from "hono";
import subtaskController from "@/modules/subtask/subtask.controller";
import authMiddleware from "@/middlewares/auth.middleware";

const subtaskRoutes = new Hono();

subtaskRoutes.use("*", authMiddleware.session());

// Get subtasks for an issue
subtaskRoutes.get("/", subtaskController.getByIssueId);

// Create subtask for an issue
subtaskRoutes.post("/", subtaskController.create);

// Update/Delete standalone subtask
// These will be mounted under /subtasks
export const standaloneSubtaskRoutes = new Hono();
standaloneSubtaskRoutes.use("*", authMiddleware.session());
standaloneSubtaskRoutes.get("/:subtaskId", subtaskController.getById);
standaloneSubtaskRoutes.patch("/:subtaskId", subtaskController.update);
standaloneSubtaskRoutes.delete("/:subtaskId", subtaskController.delete);

export default subtaskRoutes;
