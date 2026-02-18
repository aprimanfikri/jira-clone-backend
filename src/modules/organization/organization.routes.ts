import { Hono } from "hono";
import authMiddleware from "@/middlewares/auth.middleware";
import organizationController from "./organization.controller";

const organizationRoutes = new Hono();

organizationRoutes.use("*", authMiddleware.session());

organizationRoutes.post("/", organizationController.create);
organizationRoutes.get("/", organizationController.getAll);

organizationRoutes.get("/:id", organizationController.getDetail);
organizationRoutes.patch("/:id", organizationController.update);
organizationRoutes.delete("/:id", organizationController.delete);

organizationRoutes.get("/:id/members", organizationController.getMembers);
organizationRoutes.post("/:id/members", organizationController.inviteMember);
organizationRoutes.post(
	"/:id/invitations",
	authMiddleware.token("invitation"),
	organizationController.acceptInvitation,
);
organizationRoutes.patch(
	"/:id/members/:memberId",
	organizationController.updateMemberRole,
);
organizationRoutes.delete(
	"/:id/members/:memberId",
	organizationController.removeMember,
);

export default organizationRoutes;
