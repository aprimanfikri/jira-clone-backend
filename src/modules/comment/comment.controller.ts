import type { Context } from "hono";
import commentService from "@/modules/comment/comment.service";
import type {
  CreateCommentSchema,
  UpdateCommentSchema,
} from "@/modules/comment/comment.validation";

class CommentController {
  private static _instance: CommentController;
  private readonly commentService: typeof commentService;

  private constructor() {
    this.commentService = commentService;
  }

  static get instance() {
    if (!CommentController._instance) {
      CommentController._instance = new CommentController();
    }
    return CommentController._instance;
  }

  async create(c: Context) {
    const auth = c.get("auth");
    const userId = auth.id;
    const issueId = c.req.param("issueId");
    const data = await c.req.json<CreateCommentSchema>();

    const comment = await this.commentService.create(userId, issueId, data);
    return c.json({ data: comment }, 201);
  }

  async update(c: Context) {
    const auth = c.get("auth");
    const userId = auth.id;
    const id = c.req.param("id");
    const data = await c.req.json<UpdateCommentSchema>();

    const comment = await this.commentService.update(userId, id, data);
    return c.json({ data: comment });
  }

  async delete(c: Context) {
    const auth = c.get("auth");
    const userId = auth.id;
    const id = c.req.param("id");

    await this.commentService.delete(userId, id);
    return c.json({ message: "Comment deleted" });
  }

  async getByIssueId(c: Context) {
    const issueId = c.req.param("issueId");
    const comments = await this.commentService.getByIssueId(issueId);
    return c.json({ data: comments });
  }
}

const commentController = CommentController.instance;
export default commentController;
