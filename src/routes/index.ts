import { OpenAPIHono } from "@hono/zod-openapi";
import { Hono } from "hono";
import authMiddleware from "@/middlewares/auth.middleware";
import authRoute from "@/modules/auth/auth.route";
import issueController from "@/modules/issue/issue.controller";
import issueRoutes from "@/modules/issue/issue.routes";
import profileRoute from "@/modules/profile/profile.route";
import projectRoutes from "@/modules/project/project.routes";
import storageRoute from "@/modules/storage/storage.route";
import userRoutes from "@/modules/user/user.routes";
import subtaskRoutes, {
  standaloneSubtaskRoutes,
} from "@/modules/subtask/subtask.routes";

const routes = new OpenAPIHono();

routes.route("/auth", authRoute);
routes.route("/storage", storageRoute);
routes.route("/profile", profileRoute);
routes.route("/users", userRoutes);
routes.get(
  "/browse/:key",
  authMiddleware.session(),
  issueController.getDetailByKey,
);

// Project routes: /projects
routes.route("/projects", projectRoutes);

// Issue routes: /projects/:projectId/issues
const projectIssuesRouter = new Hono();
projectIssuesRouter.route("/:projectId/issues", issueRoutes);
routes.route("/projects", projectIssuesRouter);

// Standalone issue routes: GET/PATCH/DELETE /issues/:issueId
const standaloneIssueRouter = new Hono();
standaloneIssueRouter.use("*", authMiddleware.session());
standaloneIssueRouter.get("/", issueController.getUserIssues);
standaloneIssueRouter.get("/:issueId", issueController.getDetail);
standaloneIssueRouter.patch("/:issueId", issueController.update);
standaloneIssueRouter.delete("/:issueId", issueController.delete);
routes.route("/issues", standaloneIssueRouter);

// Issue subtask routes: /issues/:issueId/subtasks
const issueSubtaskRouter = new Hono();
issueSubtaskRouter.route("/:issueId/subtasks", subtaskRoutes);
routes.route("/issues", issueSubtaskRouter);

// Standalone subtask routes: /subtasks/:subtaskId
routes.route("/subtasks", standaloneSubtaskRoutes);

export default routes;
