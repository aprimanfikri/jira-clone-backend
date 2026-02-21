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

    const maxOrder = await this.issueRepository.getMaxOrder(projectId);
    return await this.issueRepository.create({
      ...data,
      projectId,
      reporterId: userId,
      key,
      status: data.status || "TODO",
      order: maxOrder + 1,
    });
  }

  async getAll(projectId: string): Promise<any[]> {
    await this.getProjectAndCheckAccess(projectId);
    return await this.issueRepository.findByProjectId(projectId);
  }

  async getUserIssues(userId: string): Promise<any[]> {
    return await this.issueRepository.findByUserId(userId);
  }

  async getDetail(issueId: string): Promise<IssueWithUsers> {
    const issue = await this.issueRepository.findById(issueId);
    if (!issue) throw new HTTPException(404, { message: "Issue not found" });
    return issue;
  }

  async getByKey(key: string): Promise<any> {
    const issue = await this.issueRepository.findByKey(key);
    if (issue) return issue;

    throw new HTTPException(404, { message: "Item not found" });
  }

  async update(id: string, data: UpdateIssueSchema): Promise<any> {
    const issue = await this.issueRepository.findById(id);
    if (!issue) throw new HTTPException(404, { message: "Item not found" });

    // Handle epicId and parentId correctly from validation
    const updateData = {
      ...data,
      assigneeId: data.assigneeId === "none" ? null : data.assigneeId,
      parentId: data.parentId === "none" ? null : data.parentId,
      epicId: data.epicId === "none" ? null : data.epicId,
    };

    return await this.issueRepository.update(id, updateData);
  }

  async reorder(projectId: string, issueIds: string[]): Promise<void> {
    await this.getProjectAndCheckAccess(projectId);
    await this.issueRepository.batchUpdateOrder(issueIds);
  }

  async delete(userId: string, id: string): Promise<void> {
    const issue = await this.issueRepository.findById(id);
    if (!issue) throw new HTTPException(404, { message: "Item not found" });

    if (issue.reporterId !== userId) {
      throw new HTTPException(403, {
        message: "Forbidden - only reporter can delete",
      });
    }
    await this.issueRepository.delete(id);
  }
}

const issueService = IssueService.instance;
export default issueService;
