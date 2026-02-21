import { HTTPException } from "hono/http-exception";
import type { Issue } from "@/database/schemas";
import type { IssueWithUsers } from "@/modules/issue/issue.repository";
import issueRepository from "@/modules/issue/issue.repository";
import type {
  CreateIssueSchema,
  UpdateIssueSchema,
} from "@/modules/issue/issue.validation";
import projectRepository from "@/modules/project/project.repository";

class IssueService {
  private static _instance: IssueService;
  private readonly issueRepository: typeof issueRepository;
  private readonly projectRepository: typeof projectRepository;

  private constructor() {
    this.issueRepository = issueRepository;
    this.projectRepository = projectRepository;
  }

  static get instance() {
    if (!IssueService._instance) {
      IssueService._instance = new IssueService();
    }
    return IssueService._instance;
  }

  private async getProjectAndCheckAccess(projectId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project)
      throw new HTTPException(404, { message: "Project not found" });
    return { project };
  }

  async create(
    userId: string,
    projectId: string,
    data: CreateIssueSchema,
  ): Promise<Issue> {
    const { project } = await this.getProjectAndCheckAccess(projectId);

    // Increment project issue count and get new number
    const newCount =
      await this.projectRepository.incrementIssueCount(projectId);
    const key = `${project.key}-${newCount}`;

    const maxOrder = await this.issueRepository.getMaxOrder(projectId, "TODO");
    return await this.issueRepository.create({
      ...data,
      projectId,
      reporterId: userId,
      key,
      status: "TODO",
      order: maxOrder + 1,
    });
  }

  async getAll(projectId: string): Promise<any[]> {
    await this.getProjectAndCheckAccess(projectId);
    const issues = await this.issueRepository.findByProjectId(projectId);

    // Fetch subtasks for this project
    const subtaskRepo = (await import("@/modules/subtask/subtask.repository"))
      .default;
    const subtasks = await subtaskRepo.findByProjectId(projectId);

    // Add type field to subtasks for frontend consistency
    const subtasksWithType = subtasks.map((s) => ({
      ...s,
      type: "SUBTASK",
    }));

    // Merge and return
    return [...issues, ...subtasksWithType];
  }

  async getUserIssues(userId: string): Promise<any[]> {
    const issues = await this.issueRepository.findByUserId(userId);

    const subtaskRepo = (await import("@/modules/subtask/subtask.repository"))
      .default;
    const subtasks = await subtaskRepo.findByUserId(userId);

    const subtasksWithType = subtasks.map((s) => ({
      ...s,
      type: "SUBTASK",
    }));

    const result = [...issues, ...subtasksWithType];

    // Sort by createdAt descending
    return result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async getDetail(issueId: string): Promise<IssueWithUsers> {
    const issue = await this.issueRepository.findById(issueId);
    if (!issue) throw new HTTPException(404, { message: "Issue not found" });
    return issue;
  }

  async getByKey(key: string): Promise<any> {
    const issue = await this.issueRepository.findByKey(key);
    if (issue) return issue;

    const subtask = await (
      await import("@/modules/subtask/subtask.repository")
    ).default.findByKey(key);
    if (subtask) return subtask;

    throw new HTTPException(404, { message: "Item not found" });
  }

  async update(id: string, data: UpdateIssueSchema): Promise<any> {
    const issue = await this.issueRepository.findById(id);
    if (issue) return await this.issueRepository.update(id, data);

    const subtaskRepo = (await import("@/modules/subtask/subtask.repository"))
      .default;
    const subtask = await subtaskRepo.findById(id);
    if (subtask) return await subtaskRepo.update(id, data);

    throw new HTTPException(404, { message: "Item not found" });
  }

  async delete(userId: string, id: string): Promise<void> {
    const issue = await this.issueRepository.findById(id);
    if (issue) {
      if (issue.reporterId !== userId) {
        throw new HTTPException(403, {
          message: "Forbidden - only reporter can delete",
        });
      }
      await this.issueRepository.delete(id);
      return;
    }

    const subtaskRepo = (await import("@/modules/subtask/subtask.repository"))
      .default;
    const subtask = await subtaskRepo.findById(id);
    if (subtask) {
      if (subtask.reporterId !== userId) {
        throw new HTTPException(403, {
          message: "Forbidden - only reporter can delete",
        });
      }
      await subtaskRepo.delete(id);
      return;
    }

    throw new HTTPException(404, { message: "Item not found" });
  }
}

const issueService = IssueService.instance;
export default issueService;
