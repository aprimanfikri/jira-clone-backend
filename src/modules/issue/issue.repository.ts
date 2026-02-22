import { eq } from "drizzle-orm";
import database from "@/database/client";
import type {
  Issue,
  IssueCreateInput,
  IssueUpdateInput,
} from "@/database/schemas";
import { issues } from "@/database/schemas";

import type { CommentWithAuthor } from "@/modules/comment/comment.repository";

export type IssueWithUsers = Issue & {
  assignee: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  reporter: { id: string; name: string; email: string; image: string | null };
  project?: { id: string; name: string; key: string };
  children?: any[]; // Using any[] to bypass recursive type issues in repository queries
  epicIssues?: any[];
  parent?: { id: string; title: string; key: string; type: string } | null;
  epic?: { id: string; title: string; key: string; type: string } | null;
  comments?: CommentWithAuthor[];
};

class IssueRepository {
  private static _instance: IssueRepository;
  private readonly database: typeof database;

  private constructor() {
    this.database = database;
  }

  static get instance() {
    if (!IssueRepository._instance) {
      IssueRepository._instance = new IssueRepository();
    }
    return IssueRepository._instance;
  }

  async create(data: IssueCreateInput): Promise<Issue> {
    const [issue] = await this.database.insert(issues).values(data).returning();
    return issue;
  }

  async findById(id: string): Promise<IssueWithUsers | null> {
    const issue = await this.database.query.issues.findFirst({
      where: (issues, { eq }) => eq(issues.id, id),
      with: {
        assignee: {
          columns: { id: true, name: true, email: true, image: true },
        },
        reporter: {
          columns: { id: true, name: true, email: true, image: true },
        },
        project: {
          columns: { id: true, name: true, key: true },
        },
        parent: {
          columns: { id: true, title: true, key: true, type: true },
        },
        epic: {
          columns: { id: true, title: true, key: true, type: true },
        },
        children: {
          with: {
            assignee: {
              columns: { id: true, name: true, email: true, image: true },
            },
          },
        },
        epicIssues: {
          with: {
            assignee: {
              columns: { id: true, name: true, email: true, image: true },
            },
          },
        },
        comments: {
          with: {
            author: {
              columns: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: (comments, { asc }) => [asc(comments.createdAt)],
        },
      },
    });
    return (issue as IssueWithUsers) ?? null;
  }

  async findByKey(key: string): Promise<IssueWithUsers | null> {
    const issue = await this.database.query.issues.findFirst({
      where: (issues, { eq }) => eq(issues.key, key),
      with: {
        assignee: {
          columns: { id: true, name: true, email: true, image: true },
        },
        reporter: {
          columns: { id: true, name: true, email: true, image: true },
        },
        project: {
          columns: { id: true, name: true, key: true },
        },
        parent: {
          columns: { id: true, title: true, key: true, type: true },
        },
        epic: {
          columns: { id: true, title: true, key: true, type: true },
        },
        children: {
          with: {
            assignee: {
              columns: { id: true, name: true, email: true, image: true },
            },
          },
        },
        epicIssues: {
          with: {
            assignee: {
              columns: { id: true, name: true, email: true, image: true },
            },
          },
        },
        comments: {
          with: {
            author: {
              columns: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: (comments, { asc }) => [asc(comments.createdAt)],
        },
      },
    });
    return (issue as IssueWithUsers) ?? null;
  }

  async findByProjectId(projectId: string): Promise<IssueWithUsers[]> {
    const results = await this.database.query.issues.findMany({
      where: (issues, { eq }) => eq(issues.projectId, projectId),
      with: {
        assignee: {
          columns: { id: true, name: true, email: true, image: true },
        },
        reporter: {
          columns: { id: true, name: true, email: true, image: true },
        },
        project: {
          columns: { id: true, name: true, key: true },
        },
        parent: {
          columns: { id: true, title: true, key: true, type: true },
        },
        epic: {
          columns: { id: true, title: true, key: true, type: true },
        },
      },
      orderBy: (issues, { asc }) => [asc(issues.order)],
    });
    return results as IssueWithUsers[];
  }

  async findByUserId(userId: string): Promise<IssueWithUsers[]> {
    return await this.database.query.issues.findMany({
      where: (issues, { or, eq }) =>
        or(eq(issues.assigneeId, userId), eq(issues.reporterId, userId)),
      with: {
        assignee: {
          columns: { id: true, name: true, email: true, image: true },
        },
        reporter: {
          columns: { id: true, name: true, email: true, image: true },
        },
        project: {
          columns: { id: true, name: true, key: true },
        },
      },
      orderBy: (issues, { asc }) => [asc(issues.order)],
    });
  }

  async getMaxOrder(projectId: string): Promise<number> {
    const result = await this.database.query.issues.findMany({
      where: (issues, { eq }) => eq(issues.projectId, projectId),
      orderBy: (issues, { desc }) => [desc(issues.order)],
      limit: 1,
    });
    return result.length > 0 ? result[0].order : -1;
  }

  async batchUpdateOrder(issueIds: string[]): Promise<void> {
    await this.database.transaction(async (tx) => {
      for (let i = 0; i < issueIds.length; i++) {
        await tx
          .update(issues)
          .set({ order: i, updatedAt: new Date() })
          .where(eq(issues.id, issueIds[i]));
      }
    });
  }

  async update(id: string, data: IssueUpdateInput): Promise<Issue> {
    const [updated] = await this.database
      .update(issues)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(issues.id, id))
      .returning();
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.database.delete(issues).where(eq(issues.id, id));
  }
}

const issueRepository = IssueRepository.instance;
export default issueRepository;
