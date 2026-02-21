import { eq, inArray } from "drizzle-orm";
import database from "@/database/client";
import { subtasks } from "@/database/schemas/subtask";
import { issues } from "@/database/schemas/issue";
import type {
  Subtask,
  SubtaskCreateInput,
  SubtaskUpdateInput,
} from "@/database/schemas/subtask";

export type SubtaskWithUsers = Subtask & {
  assignee: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  reporter: { id: string; name: string; email: string; image: string | null };
};

class SubtaskRepository {
  private static _instance: SubtaskRepository;
  private readonly database: typeof database;

  private constructor() {
    this.database = database;
  }

  static get instance() {
    if (!SubtaskRepository._instance) {
      SubtaskRepository._instance = new SubtaskRepository();
    }
    return SubtaskRepository._instance;
  }

  async create(data: SubtaskCreateInput): Promise<Subtask> {
    const [subtask] = await this.database
      .insert(subtasks)
      .values(data)
      .returning();
    return subtask;
  }

  async findByIssueId(issueId: string): Promise<SubtaskWithUsers[]> {
    return await this.database.query.subtasks.findMany({
      where: (subtasks, { eq }) => eq(subtasks.issueId, issueId),
      with: {
        assignee: {
          columns: { id: true, name: true, email: true, image: true },
        },
        reporter: {
          columns: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: (subtasks, { asc }) => [asc(subtasks.order)],
    });
  }

  async findById(id: string): Promise<any | null> {
    const subtask = await this.database.query.subtasks.findFirst({
      where: (subtasks, { eq }) => eq(subtasks.id, id),
      with: {
        assignee: {
          columns: { id: true, name: true, email: true, image: true },
        },
        reporter: {
          columns: { id: true, name: true, email: true, image: true },
        },
        issue: {
          columns: { id: true, title: true, key: true, type: true },
          with: {
            project: {
              columns: { id: true, name: true, key: true },
            },
          },
        },
      },
    });
    return subtask ?? null;
  }

  async findByKey(key: string): Promise<any | null> {
    const subtask = await this.database.query.subtasks.findFirst({
      where: (subtasks, { eq }) => eq(subtasks.key, key),
      with: {
        assignee: {
          columns: { id: true, name: true, email: true, image: true },
        },
        reporter: {
          columns: { id: true, name: true, email: true, image: true },
        },
        issue: {
          columns: { id: true, title: true, key: true, type: true },
          with: {
            project: {
              columns: { id: true, name: true, key: true },
            },
          },
        },
      },
    });
    return subtask ?? null;
  }

  async findByProjectId(projectId: string): Promise<any[]> {
    const issueIds = await this.database
      .select({ id: issues.id })
      .from(issues)
      .where(eq(issues.projectId, projectId));

    if (issueIds.length === 0) return [];

    const ids = issueIds.map((i) => i.id);

    return await this.database.query.subtasks.findMany({
      where: (subtasks, { inArray }) => inArray(subtasks.issueId, ids),
      with: {
        assignee: {
          columns: { id: true, name: true, email: true, image: true },
        },
        reporter: {
          columns: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: (subtasks, { asc }) => [asc(subtasks.order)],
    });
  }

  async findByUserId(userId: string): Promise<any[]> {
    return await this.database.query.subtasks.findMany({
      where: (subtasks, { or, eq }) =>
        or(eq(subtasks.assigneeId, userId), eq(subtasks.reporterId, userId)),
      with: {
        assignee: {
          columns: { id: true, name: true, email: true, image: true },
        },
        reporter: {
          columns: { id: true, name: true, email: true, image: true },
        },
        issue: {
          columns: { id: true, title: true, key: true, type: true },
          with: {
            project: {
              columns: { id: true, name: true, key: true },
            },
          },
        },
      },
      orderBy: (subtasks, { desc }) => [desc(subtasks.createdAt)],
    });
  }

  async update(id: string, data: SubtaskUpdateInput): Promise<Subtask> {
    const [updated] = await this.database
      .update(subtasks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subtasks.id, id))
      .returning();
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.database.delete(subtasks).where(eq(subtasks.id, id));
  }

  async getMaxOrder(
    issueId: string,
    status: Subtask["status"],
  ): Promise<number> {
    const result = await this.database.query.subtasks.findMany({
      where: (subtasks, { and, eq }) =>
        and(eq(subtasks.issueId, issueId), eq(subtasks.status, status)),
      orderBy: (subtasks, { desc }) => [desc(subtasks.order)],
      limit: 1,
    });
    return result.length > 0 ? result[0].order : -1;
  }
}

const subtaskRepository = SubtaskRepository.instance;
export default subtaskRepository;
