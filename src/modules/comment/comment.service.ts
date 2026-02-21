import { HTTPException } from "hono/http-exception";
import type { Comment } from "@/database/schemas";
import type { CommentWithAuthor } from "@/modules/comment/comment.repository";
import commentRepository from "@/modules/comment/comment.repository";
import type {
  CreateCommentSchema,
  UpdateCommentSchema,
} from "@/modules/comment/comment.validation";
import issueRepository from "@/modules/issue/issue.repository";

class CommentService {
  private static _instance: CommentService;
  private readonly commentRepository: typeof commentRepository;
  private readonly issueRepository: typeof issueRepository;

  private constructor() {
    this.commentRepository = commentRepository;
    this.issueRepository = issueRepository;
  }

  static get instance() {
    if (!CommentService._instance) {
      CommentService._instance = new CommentService();
    }
    return CommentService._instance;
  }

  async create(
    userId: string,
    issueId: string,
    data: CreateCommentSchema,
  ): Promise<Comment> {
    const issue = await this.issueRepository.findById(issueId);
    if (!issue) throw new HTTPException(404, { message: "Issue not found" });

    if (data.parentId) {
      const parentComment = await this.commentRepository.findById(
        data.parentId,
      );
      if (!parentComment)
        throw new HTTPException(404, { message: "Parent comment not found" });
    }

    return await this.commentRepository.create({
      ...data,
      issueId,
      authorId: userId,
    });
  }

  async update(
    userId: string,
    id: string,
    data: UpdateCommentSchema,
  ): Promise<Comment> {
    const comment = await this.commentRepository.findById(id);
    if (!comment)
      throw new HTTPException(404, { message: "Comment not found" });

    if (comment.authorId !== userId) {
      throw new HTTPException(403, {
        message: "Forbidden - only author can edit",
      });
    }

    return await this.commentRepository.update(id, data);
  }

  async delete(userId: string, id: string): Promise<void> {
    const comment = await this.commentRepository.findById(id);
    if (!comment)
      throw new HTTPException(404, { message: "Comment not found" });

    if (comment.authorId !== userId) {
      throw new HTTPException(403, {
        message: "Forbidden - only author can delete",
      });
    }

    await this.commentRepository.delete(id);
  }

  async getByIssueId(issueId: string): Promise<CommentWithAuthor[]> {
    return await this.commentRepository.findByIssueId(issueId);
  }
}

const commentService = CommentService.instance;
export default commentService;
