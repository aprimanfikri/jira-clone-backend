import { eq } from "drizzle-orm";
import database from "@/database/client";
import type {
  Comment,
  CommentCreateInput,
  CommentUpdateInput,
} from "@/database/schemas";
import { comments } from "@/database/schemas";

export type CommentWithAuthor = Comment & {
  author: { id: string; name: string; email: string; image: string | null };
  replies?: CommentWithAuthor[];
};

class CommentRepository {
  private static _instance: CommentRepository;
  private readonly database: typeof database;

  private constructor() {
    this.database = database;
  }

  static get instance() {
    if (!CommentRepository._instance) {
      CommentRepository._instance = new CommentRepository();
    }
    return CommentRepository._instance;
  }

  async create(data: CommentCreateInput): Promise<Comment> {
    const [comment] = await this.database
      .insert(comments)
      .values(data)
      .returning();
    return comment;
  }

  async findById(id: string): Promise<CommentWithAuthor | null> {
    const comment = await this.database.query.comments.findFirst({
      where: (comments, { eq }) => eq(comments.id, id),
      with: {
        author: {
          columns: { id: true, name: true, email: true, image: true },
        },
        replies: {
          with: {
            author: {
              columns: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
    });
    return (comment as CommentWithAuthor) ?? null;
  }

  async findByIssueId(issueId: string): Promise<CommentWithAuthor[]> {
    const allComments = await this.database.query.comments.findMany({
      where: (comments, { eq }) => eq(comments.issueId, issueId),
      with: {
        author: {
          columns: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: (comments, { asc }) => [asc(comments.createdAt)],
    });

    const commentMap = new Map<string, CommentWithAuthor>();
    const rootComments: CommentWithAuthor[] = [];

    // First pass: Create the map
    allComments.forEach((comment) => {
      commentMap.set(comment.id, {
        ...(comment as CommentWithAuthor),
        replies: [],
      });
    });

    // Second pass: Build the tree
    allComments.forEach((comment) => {
      const commentWithAuthor = commentMap.get(comment.id)!;
      if (comment.parentId && commentMap.has(comment.parentId)) {
        const parent = commentMap.get(comment.parentId)!;
        parent.replies = parent.replies || [];
        parent.replies.push(commentWithAuthor);
      } else {
        rootComments.push(commentWithAuthor);
      }
    });

    return rootComments;
  }

  async update(id: string, data: CommentUpdateInput): Promise<Comment> {
    const [updated] = await this.database
      .update(comments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.database.delete(comments).where(eq(comments.id, id));
  }
}

const commentRepository = CommentRepository.instance;
export default commentRepository;
