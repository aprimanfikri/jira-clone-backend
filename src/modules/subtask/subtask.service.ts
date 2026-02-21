import { HTTPException } from "hono/http-exception";
import subtaskRepository from "@/modules/subtask/subtask.repository";
import type { Subtask } from "@/database/schemas/subtask";
import type { SubtaskWithUsers } from "@/modules/subtask/subtask.repository";
import type {
  CreateSubtaskSchema,
  UpdateSubtaskSchema,
} from "@/modules/subtask/subtask.validation";
import issueRepository from "@/modules/issue/issue.repository";
import projectRepository from "@/modules/project/project.repository";

class SubtaskService {
  private static _instance: SubtaskService;
  private readonly subtaskRepository: typeof subtaskRepository;
  private readonly issueRepository: typeof issueRepository;
  private readonly projectRepository: typeof projectRepository;

  private constructor() {
    this.subtaskRepository = subtaskRepository;
    this.issueRepository = issueRepository;
    this.projectRepository = projectRepository;
  }

  static get instance() {
    if (!SubtaskService._instance) {
      SubtaskService._instance = new SubtaskService();
    }
    return SubtaskService._instance;
  }

  async create(
    userId: string,
    issueId: string,
    data: CreateSubtaskSchema,
  ): Promise<Subtask> {
    const issue = await this.issueRepository.findById(issueId);
    if (!issue) throw new HTTPException(404, { message: "Issue not found" });

    const projectId = issue.projectId;
    const project = await this.projectRepository.findById(projectId);
    if (!project)
      throw new HTTPException(404, { message: "Project not found" });

    // Increment project issue count and get new number
    const updatedCount =
      await this.projectRepository.incrementIssueCount(projectId);
    const key = `${project.key}-${updatedCount}`;

    const maxOrder = await this.subtaskRepository.getMaxOrder(issueId, "TODO");
    return await this.subtaskRepository.create({
      ...data,
      issueId,
      reporterId: userId,
      key,
      order: maxOrder + 1,
    });
  }

  async getByIssueId(issueId: string): Promise<SubtaskWithUsers[]> {
    const issue = await this.issueRepository.findById(issueId);
    if (!issue) throw new HTTPException(404, { message: "Issue not found" });
    return await this.subtaskRepository.findByIssueId(issueId);
  }

  async getById(subtaskId: string): Promise<any> {
    const subtask = await this.subtaskRepository.findById(subtaskId);
    if (!subtask)
      throw new HTTPException(404, { message: "Subtask not found" });
    return subtask;
  }

  async update(subtaskId: string, data: UpdateSubtaskSchema): Promise<Subtask> {
    const subtask = await this.subtaskRepository.findById(subtaskId);
    if (!subtask)
      throw new HTTPException(404, { message: "Subtask not found" });
    return await this.subtaskRepository.update(subtaskId, data);
  }

  async delete(userId: string, subtaskId: string): Promise<void> {
    const subtask = await this.subtaskRepository.findById(subtaskId);
    if (!subtask)
      throw new HTTPException(404, { message: "Subtask not found" });

    if (subtask.reporterId !== userId) {
      throw new HTTPException(403, {
        message: "Forbidden - only reporter can delete",
      });
    }
    await this.subtaskRepository.delete(subtaskId);
  }
}

const subtaskService = SubtaskService.instance;
export default subtaskService;
