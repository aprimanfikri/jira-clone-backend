import type { Context } from "hono";
import responseHandler from "@/helpers/response";
import subtaskService from "@/modules/subtask/subtask.service";
import {
  createSubtaskSchema,
  updateSubtaskSchema,
} from "@/modules/subtask/subtask.validation";
import { RESPONSE_CODES, type SessionData } from "@/types";

class SubtaskController {
  private static _instance: SubtaskController;
  private readonly subtaskService: typeof subtaskService;
  private readonly responseHandler: typeof responseHandler;

  private constructor() {
    this.subtaskService = subtaskService;
    this.responseHandler = responseHandler;
  }

  static get instance() {
    if (!SubtaskController._instance) {
      SubtaskController._instance = new SubtaskController();
    }
    return SubtaskController._instance;
  }

  create = async (c: Context) => {
    const user = c.get("auth") as SessionData["user"];
    const issueId = c.req.param("issueId");
    const body = await c.req.json();
    const data = createSubtaskSchema.parse(body);
    const result = await this.subtaskService.create(user.id, issueId, data);
    return this.responseHandler.success(
      c,
      "Subtask created successfully",
      result,
      RESPONSE_CODES.SUCCESS,
      201,
    );
  };

  getByIssueId = async (c: Context) => {
    const issueId = c.req.param("issueId");
    const result = await this.subtaskService.getByIssueId(issueId);
    return this.responseHandler.success(
      c,
      "Subtasks retrieved successfully",
      result,
      RESPONSE_CODES.SUCCESS,
    );
  };

  getById = async (c: Context) => {
    const subtaskId = c.req.param("subtaskId");
    const result = await this.subtaskService.getById(subtaskId);
    return this.responseHandler.success(
      c,
      "Subtask retrieved successfully",
      result,
      RESPONSE_CODES.SUCCESS,
    );
  };

  update = async (c: Context) => {
    const subtaskId = c.req.param("subtaskId");
    const body = await c.req.json();
    const data = updateSubtaskSchema.parse(body);
    const result = await this.subtaskService.update(subtaskId, data);
    return this.responseHandler.success(
      c,
      "Subtask updated successfully",
      result,
      RESPONSE_CODES.SUCCESS,
    );
  };

  delete = async (c: Context) => {
    const user = c.get("auth") as SessionData["user"];
    const subtaskId = c.req.param("subtaskId");
    await this.subtaskService.delete(user.id, subtaskId);
    return this.responseHandler.success(
      c,
      "Subtask deleted successfully",
      undefined,
      RESPONSE_CODES.SUCCESS,
    );
  };
}

const subtaskController = SubtaskController.instance;
export default subtaskController;
