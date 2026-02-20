import type { Context } from "hono";
import responseHandler from "@/helpers/response";
import issueService from "@/modules/issue/issue.service";
import {
  type CreateIssueSchema,
  createIssueSchema,
  type UpdateIssueSchema,
  updateIssueSchema,
} from "@/modules/issue/issue.validation";
import { RESPONSE_CODES, type SessionData } from "@/types";

class IssueController {
  private static _instance: IssueController;
  private readonly issueService: typeof issueService;
  private readonly responseHandler: typeof responseHandler;

  private constructor() {
    this.issueService = issueService;
    this.responseHandler = responseHandler;
  }

  static get instance() {
    if (!IssueController._instance) {
      IssueController._instance = new IssueController();
    }
    return IssueController._instance;
  }

  create = async (c: Context) => {
    const user = c.get("auth") as SessionData["user"];
    const projectId = c.req.param("projectId");
    const body = await c.req.json<CreateIssueSchema>();
    const data = createIssueSchema.parse(body);
    const result = await this.issueService.create(user.id, projectId, data);
    return this.responseHandler.success(
      c,
      "Issue created successfully",
      result,
      RESPONSE_CODES.SUCCESS,
      201,
    );
  };

  getAll = async (c: Context) => {
    const user = c.get("auth") as SessionData["user"];
    const projectId = c.req.param("projectId");
    const result = await this.issueService.getAll(user.id, projectId);
    return this.responseHandler.success(
      c,
      "Issues retrieved successfully",
      result,
      RESPONSE_CODES.SUCCESS,
    );
  };

  getDetail = async (c: Context) => {
    const user = c.get("auth") as SessionData["user"];
    const issueId = c.req.param("issueId");
    const result = await this.issueService.getDetail(user.id, issueId);
    return this.responseHandler.success(
      c,
      "Issue retrieved successfully",
      result,
      RESPONSE_CODES.SUCCESS,
    );
  };

  getDetailByKey = async (c: Context) => {
    const user = c.get("auth") as SessionData["user"];
    const key = c.req.param("key");
    const result = await this.issueService.getByKey(user.id, key);
    return this.responseHandler.success(
      c,
      "Issue retrieved successfully",
      result,
      RESPONSE_CODES.SUCCESS,
    );
  };

  update = async (c: Context) => {
    const user = c.get("auth") as SessionData["user"];
    const issueId = c.req.param("issueId");
    const body = await c.req.json<UpdateIssueSchema>();
    const data = updateIssueSchema.parse(body);
    const result = await this.issueService.update(user.id, issueId, data);
    return this.responseHandler.success(
      c,
      "Issue updated successfully",
      result,
      RESPONSE_CODES.SUCCESS,
    );
  };

  delete = async (c: Context) => {
    const user = c.get("auth") as SessionData["user"];
    const issueId = c.req.param("issueId");
    await this.issueService.delete(user.id, issueId);
    return this.responseHandler.success(
      c,
      "Issue deleted successfully",
      undefined,
      RESPONSE_CODES.SUCCESS,
    );
  };
}

const issueController = IssueController.instance;
export default issueController;
