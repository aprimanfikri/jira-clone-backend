import type { Context } from "hono";
import responseHandler from "@/helpers/response";
import projectService from "@/modules/project/project.service";
import {
  type CreateProjectSchema,
  createProjectSchema,
  type UpdateProjectSchema,
  updateProjectSchema,
} from "@/modules/project/project.validation";
import { RESPONSE_CODES, type SessionData } from "@/types";

class ProjectController {
  private static _instance: ProjectController;
  private readonly projectService: typeof projectService;
  private readonly responseHandler: typeof responseHandler;

  private constructor() {
    this.projectService = projectService;
    this.responseHandler = responseHandler;
  }

  static get instance() {
    if (!ProjectController._instance) {
      ProjectController._instance = new ProjectController();
    }
    return ProjectController._instance;
  }

  create = async (c: Context) => {
    const user = c.get("auth") as SessionData["user"];
    const body = await c.req.json<CreateProjectSchema>();
    const data = createProjectSchema.parse(body);
    const result = await this.projectService.create(user.id, data);
    return this.responseHandler.success(
      c,
      "Project created successfully",
      result,
      RESPONSE_CODES.SUCCESS,
      201,
    );
  };

  getAll = async (c: Context) => {
    const user = c.get("auth") as SessionData["user"];
    const result = await this.projectService.getAll();
    return this.responseHandler.success(
      c,
      "Projects retrieved successfully",
      result,
      RESPONSE_CODES.SUCCESS,
    );
  };

  getDetail = async (c: Context) => {
    const user = c.get("auth") as SessionData["user"];
    const projectId = c.req.param("projectId");
    const result = await this.projectService.getDetail(user.id, projectId);
    return this.responseHandler.success(
      c,
      "Project retrieved successfully",
      result,
      RESPONSE_CODES.SUCCESS,
    );
  };

  getDetailByKey = async (c: Context) => {
    const user = c.get("auth") as SessionData["user"];
    const key = c.req.param("key");
    const result = await this.projectService.getDetailByKey(user.id, key);
    return this.responseHandler.success(
      c,
      "Project retrieved successfully",
      result,
      RESPONSE_CODES.SUCCESS,
    );
  };

  update = async (c: Context) => {
    const user = c.get("auth") as SessionData["user"];
    const projectId = c.req.param("projectId");
    const body = await c.req.json<UpdateProjectSchema>();
    const data = updateProjectSchema.parse(body);
    const result = await this.projectService.update(user.id, projectId, data);
    return this.responseHandler.success(
      c,
      "Project updated successfully",
      result,
      RESPONSE_CODES.SUCCESS,
    );
  };

  delete = async (c: Context) => {
    const user = c.get("auth") as SessionData["user"];
    const projectId = c.req.param("projectId");
    await this.projectService.delete(user.id, projectId);
    return this.responseHandler.success(
      c,
      "Project deleted successfully",
      undefined,
      RESPONSE_CODES.SUCCESS,
    );
  };
}

const projectController = ProjectController.instance;
export default projectController;
