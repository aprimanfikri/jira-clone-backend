import { HTTPException } from "hono/http-exception";
import type { Project } from "@/database/schemas";
import projectRepository from "@/modules/project/project.repository";
import type {
  CreateProjectSchema,
  UpdateProjectSchema,
} from "@/modules/project/project.validation";

class ProjectService {
  private static _instance: ProjectService;
  private readonly projectRepository: typeof projectRepository;

  private constructor() {
    this.projectRepository = projectRepository;
  }

  static get instance() {
    if (!ProjectService._instance) {
      ProjectService._instance = new ProjectService();
    }
    return ProjectService._instance;
  }

  private generateKey(name: string): string {
    const words = name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "")
      .trim()
      .split(/\s+/);

    if (words.length > 1) {
      return words
        .map((w) => w[0])
        .join("")
        .slice(0, 10);
    }

    return words[0].slice(0, 3);
  }

  private async getUniqueKey(name: string): Promise<string> {
    const base = this.generateKey(name) || "PROJ";
    let key = base;
    let counter = 1;
    while (true) {
      const existing = await this.projectRepository.findByKey(key);
      if (!existing) break;
      key = `${base.slice(0, 7)}${counter}`;
      counter++;
    }
    return key;
  }

  async create(userId: string, data: CreateProjectSchema): Promise<Project> {
    const key = await this.getUniqueKey(data.name);
    return await this.projectRepository.create({
      ...data,
      key,
      leadId: userId,
    });
  }

  async getAll(): Promise<Project[]> {
    return await this.projectRepository.findAll();
  }

  async getDetail(userId: string, projectId: string): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);
    if (!project)
      throw new HTTPException(404, { message: "Project not found" });
    return project;
  }

  async getDetailByKey(userId: string, key: string): Promise<Project> {
    const project = await this.projectRepository.findByKey(key);
    if (!project)
      throw new HTTPException(404, { message: "Project not found" });
    return project;
  }

  async update(
    userId: string,
    projectId: string,
    data: UpdateProjectSchema,
  ): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);
    if (!project)
      throw new HTTPException(404, { message: "Project not found" });
    return await this.projectRepository.update(projectId, data);
  }

  async delete(userId: string, projectId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project)
      throw new HTTPException(404, { message: "Project not found" });
    await this.projectRepository.delete(projectId);
  }
}

const projectService = ProjectService.instance;
export default projectService;
