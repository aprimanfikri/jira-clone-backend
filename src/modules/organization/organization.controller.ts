import type { Context } from "hono";
import responseHandler from "@/helpers/response";
import organizationService from "@/modules/organization/organization.service";
import {
	type CreateOrganizationSchema,
	createOrganizationSchema,
	type InviteMemberSchema,
	inviteMemberSchema,
	type UpdateMemberRoleSchema,
	type UpdateOrganizationSchema,
	updateMemberRoleSchema,
	updateOrganizationSchema,
} from "@/modules/organization/organization.validation";
import { RESPONSE_CODES, type SessionData } from "@/types";

class OrganizationController {
	private static _instance: OrganizationController;
	private readonly organizationService: typeof organizationService;
	private readonly responseHandler: typeof responseHandler;

	private constructor() {
		this.organizationService = organizationService;
		this.responseHandler = responseHandler;
	}

	static get instance() {
		if (!OrganizationController._instance) {
			OrganizationController._instance = new OrganizationController();
		}
		return OrganizationController._instance;
	}

	create = async (c: Context) => {
		const user = c.get("auth") as SessionData["user"];
		const body = await c.req.json<CreateOrganizationSchema>();
		const data = createOrganizationSchema.parse(body);
		const result = await this.organizationService.create(user.id, data);
		return this.responseHandler.success(
			c,
			"Organization created successfully",
			result,
			RESPONSE_CODES.SUCCESS,
			201,
		);
	};

	getAll = async (c: Context) => {
		const user = c.get("auth") as SessionData["user"];
		const result = await this.organizationService.getAllMyOrganizations(
			user.id,
		);
		return this.responseHandler.success(
			c,
			"Organizations retrieved successfully",
			result,
			RESPONSE_CODES.SUCCESS,
			200,
		);
	};

	getDetail = async (c: Context) => {
		const user = c.get("auth") as SessionData["user"];
		const id = c.req.param("id");
		const result = await this.organizationService.getDetail(id, user.id);
		return this.responseHandler.success(
			c,
			"Organization detail retrieved successfully",
			result,
			RESPONSE_CODES.SUCCESS,
			200,
		);
	};

	update = async (c: Context) => {
		const user = c.get("auth") as SessionData["user"];
		const id = c.req.param("id");
		const body = await c.req.json<UpdateOrganizationSchema>();
		const data = updateOrganizationSchema.parse(body);
		const result = await this.organizationService.update(id, user.id, data);
		return this.responseHandler.success(
			c,
			"Organization updated successfully",
			result,
			RESPONSE_CODES.SUCCESS,
			200,
		);
	};

	delete = async (c: Context) => {
		const user = c.get("auth") as SessionData["user"];
		const id = c.req.param("id");
		await this.organizationService.delete(id, user.id);
		return this.responseHandler.success(
			c,
			"Organization deleted successfully",
			undefined,
			RESPONSE_CODES.SUCCESS,
			200,
		);
	};

	inviteMember = async (c: Context) => {
		const user = c.get("auth") as SessionData["user"];
		const id = c.req.param("id");
		const body = await c.req.json<InviteMemberSchema>();
		const data = inviteMemberSchema.parse(body);
		const result = await this.organizationService.inviteMember(
			id,
			user.id,
			data,
		);
		return this.responseHandler.success(
			c,
			"Member invited successfully",
			result,
			RESPONSE_CODES.SUCCESS,
			200,
		);
	};

	acceptInvitation = async (c: Context) => {
		const user = c.get("auth") as SessionData["user"];
		const id = c.req.param("id");
		await this.organizationService.acceptInvitation(user, id);
		return this.responseHandler.success(
			c,
			"Invitation accepted successfully",
			undefined,
			RESPONSE_CODES.SUCCESS,
			200,
		);
	};

	getMembers = async (c: Context) => {
		const user = c.get("auth") as SessionData["user"];
		const id = c.req.param("id");
		const result = await this.organizationService.getMembers(id, user.id);
		return this.responseHandler.success(
			c,
			"Members retrieved successfully",
			result,
			RESPONSE_CODES.SUCCESS,
			200,
		);
	};

	updateMemberRole = async (c: Context) => {
		const user = c.get("auth") as SessionData["user"];
		const id = c.req.param("id");
		const memberId = c.req.param("memberId");
		const body = await c.req.json<UpdateMemberRoleSchema>();
		const data = updateMemberRoleSchema.parse(body);
		const result = await this.organizationService.updateMemberRole(
			id,
			user.id,
			memberId,
			data,
		);
		return this.responseHandler.success(
			c,
			"Member role updated successfully",
			result,
			RESPONSE_CODES.SUCCESS,
			200,
		);
	};

	removeMember = async (c: Context) => {
		const user = c.get("auth") as SessionData["user"];
		const id = c.req.param("id");
		const memberId = c.req.param("memberId");
		await this.organizationService.removeMember(id, user.id, memberId);
		return this.responseHandler.success(
			c,
			"Member removed successfully",
			undefined,
			RESPONSE_CODES.SUCCESS,
			200,
		);
	};
}

const organizationController = OrganizationController.instance;
export default organizationController;
