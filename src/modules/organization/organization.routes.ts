import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import authMiddleware from "@/middlewares/auth.middleware";
import organizationController from "./organization.controller";
import {
	createOrganizationSchema,
	inviteMemberSchema,
	updateMemberRoleSchema,
	updateOrganizationSchema,
} from "./organization.validation";

const organizationRoutes = new OpenAPIHono();

const tags = ["Organizations"];
const idParam = z.object({ id: z.string().openapi({ example: "org_abc123" }) });
const memberIdParams = z.object({
	id: z.string().openapi({ example: "org_abc123" }),
	memberId: z.string().openapi({ example: "usr_xyz789" }),
});

organizationRoutes.use("*", authMiddleware.session());

const createOrgRoute = createRoute({
	method: "post",
	path: "/",
	tags,
	security: [{ cookieAuth: [] }],
	request: {
		body: {
			content: { "application/json": { schema: createOrganizationSchema } },
		},
	},
	responses: { 200: { description: "Organization created" } },
});
organizationRoutes.openapi(createOrgRoute, organizationController.create);

const getAllOrgsRoute = createRoute({
	method: "get",
	path: "/",
	tags,
	security: [{ cookieAuth: [] }],
	responses: { 200: { description: "List of organizations" } },
});
organizationRoutes.openapi(getAllOrgsRoute, organizationController.getAll);

const getOrgDetailRoute = createRoute({
	method: "get",
	path: "/{id}",
	tags,
	security: [{ cookieAuth: [] }],
	request: { params: idParam },
	responses: { 200: { description: "Organization detail" } },
});
organizationRoutes.openapi(getOrgDetailRoute, organizationController.getDetail);

const updateOrgRoute = createRoute({
	method: "patch",
	path: "/{id}",
	tags,
	security: [{ cookieAuth: [] }],
	request: {
		params: idParam,
		body: {
			content: { "application/json": { schema: updateOrganizationSchema } },
		},
	},
	responses: { 200: { description: "Organization updated" } },
});
organizationRoutes.openapi(updateOrgRoute, organizationController.update);

const deleteOrgRoute = createRoute({
	method: "delete",
	path: "/{id}",
	tags,
	security: [{ cookieAuth: [] }],
	request: { params: idParam },
	responses: { 200: { description: "Organization deleted" } },
});
organizationRoutes.openapi(deleteOrgRoute, organizationController.delete);

const getMembersRoute = createRoute({
	method: "get",
	path: "/{id}/members",
	tags,
	security: [{ cookieAuth: [] }],
	request: { params: idParam },
	responses: { 200: { description: "List of members" } },
});
organizationRoutes.openapi(getMembersRoute, organizationController.getMembers);

const inviteMemberRoute = createRoute({
	method: "post",
	path: "/{id}/members",
	tags,
	security: [{ cookieAuth: [] }],
	request: {
		params: idParam,
		body: { content: { "application/json": { schema: inviteMemberSchema } } },
	},
	responses: { 200: { description: "Member invited" } },
});
organizationRoutes.openapi(
	inviteMemberRoute,
	organizationController.inviteMember,
);

const acceptInvitationRoute = createRoute({
	method: "post",
	path: "/{id}/invitations",
	tags,
	security: [{ bearerAuth: [] }],
	request: { params: idParam },
	responses: { 200: { description: "Invitation accepted" } },
});
organizationRoutes.use("/:id/invitations", authMiddleware.token("invitation"));
organizationRoutes.openapi(
	acceptInvitationRoute,
	organizationController.acceptInvitation,
);

const updateMemberRoleRoute = createRoute({
	method: "patch",
	path: "/{id}/members/{memberId}",
	tags,
	security: [{ cookieAuth: [] }],
	request: {
		params: memberIdParams,
		body: {
			content: { "application/json": { schema: updateMemberRoleSchema } },
		},
	},
	responses: { 200: { description: "Member role updated" } },
});
organizationRoutes.openapi(
	updateMemberRoleRoute,
	organizationController.updateMemberRole,
);

const removeMemberRoute = createRoute({
	method: "delete",
	path: "/{id}/members/{memberId}",
	tags,
	security: [{ cookieAuth: [] }],
	request: { params: memberIdParams },
	responses: { 200: { description: "Member removed" } },
});
organizationRoutes.openapi(
	removeMemberRoute,
	organizationController.removeMember,
);

export default organizationRoutes;
