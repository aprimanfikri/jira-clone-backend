import { Hono } from "hono";
import commentController from "@/modules/comment/comment.controller";
import authMiddleware from "@/middlewares/auth.middleware";

const commentRoutes = new Hono();

// Nested under /issues/:issueId/comments in main router or handled here
commentRoutes.use("*", authMiddleware.session());

commentRoutes.post("/:issueId/comments", (c) => commentController.create(c));
commentRoutes.get("/:issueId/comments", (c) =>
  commentController.getByIssueId(c),
);
commentRoutes.patch("/comments/:id", (c) => commentController.update(c));
commentRoutes.delete("/comments/:id", (c) => commentController.delete(c));

export default commentRoutes;
