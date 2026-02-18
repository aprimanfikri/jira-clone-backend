import { HTTPException } from "hono/http-exception";
import { env } from "@/config/env";
import type {
	Organization,
	OrganizationMember,
	OrganizationUpdateInput,
} from "@/database/schemas";
import emailHelper from "@/helpers/email";
import tokenHelper from "@/helpers/token";
import authRepository from "@/modules/auth/auth.repository";
import organizationRepository from "@/modules/organization/organization.repository";
import type {
	CreateOrganizationSchema,
	InviteMemberSchema,
	UpdateMemberRoleSchema,
	UpdateOrganizationSchema,
} from "@/modules/organization/organization.validation";
import storageService from "@/modules/storage/storage.service";
import type {
	JwtPayload,
	OrganizationMemberWithUser,
	OrganizationWithOwner,
} from "@/types";

class OrganizationService {
	private static _instance: OrganizationService;
	private readonly organizationRepository: typeof organizationRepository;
	private readonly authRepository: typeof authRepository;
	private readonly tokenHelper: typeof tokenHelper;
	private readonly emailHelper: typeof emailHelper;
	private readonly storageService: typeof storageService;

	private constructor() {
		this.organizationRepository = organizationRepository;
		this.authRepository = authRepository;
		this.tokenHelper = tokenHelper;
		this.emailHelper = emailHelper;
		this.storageService = storageService;
	}

	static get instance() {
		if (!OrganizationService._instance) {
			OrganizationService._instance = new OrganizationService();
		}
		return OrganizationService._instance;
	}

	private async getMemberRole(
		organizationId: string,
		userId: string,
	): Promise<OrganizationMember["role"] | null> {
		const member = await this.organizationRepository.findMember(
			organizationId,
			userId,
		);
		return member?.role ?? null;
	}

	private async ensureRole(
		organizationId: string,
		userId: string,
		allowedRoles: OrganizationMember["role"][],
	) {
		const role = await this.getMemberRole(organizationId, userId);
		if (!role || !allowedRoles.includes(role)) {
			throw new HTTPException(403, { message: "Forbidden" });
		}
		return role;
	}

	private generateSlug(title: string): string {
		return title
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, "")
			.replace(/[\s_-]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}

	private async getUniqueSlug(
		title: string,
		currentId?: string,
	): Promise<string> {
		const baseSlug = this.generateSlug(title);
		let slug = baseSlug;
		let counter = 1;

		while (true) {
			const existing = await this.organizationRepository.findBySlug(slug);
			if (!existing || existing.id === currentId) break;
			slug = `${baseSlug}-${counter}`;
			counter++;
		}
		return slug;
	}

	async create(
		userId: string,
		data: CreateOrganizationSchema,
	): Promise<Organization> {
		const slug = await this.getUniqueSlug(data.name);
		return await this.organizationRepository.createWithInitialOwner(
			{
				...data,
				ownerId: userId,
				slug,
			},
			userId,
		);
	}

	async getAllMyOrganizations(userId: string): Promise<Organization[]> {
		return await this.organizationRepository.findOrganizationsByUserId(userId);
	}

	async getDetail(
		organizationId: string,
		userId: string,
	): Promise<OrganizationWithOwner> {
		const member = await this.organizationRepository.findMember(
			organizationId,
			userId,
		);
		if (!member) {
			throw new HTTPException(404, { message: "Organization not found" });
		}
		const organization =
			await this.organizationRepository.findById(organizationId);
		if (!organization) {
			throw new HTTPException(404, { message: "Organization not found" });
		}
		return organization;
	}

	async update(
		organizationId: string,
		userId: string,
		data: UpdateOrganizationSchema,
	): Promise<Organization> {
		await this.ensureRole(organizationId, userId, ["OWNER", "ADMIN"]);
		const oldOrganization =
			await this.organizationRepository.findById(organizationId);
		if (!oldOrganization) {
			throw new HTTPException(404, { message: "Organization not found" });
		}
		const updateData: OrganizationUpdateInput = { ...data };
		if (data.name) {
			const slug = await this.getUniqueSlug(data.name, organizationId);
			updateData.slug = slug;
		}
		const updatedOrganization = await this.organizationRepository.update(
			organizationId,
			updateData,
		);
		if (
			data.logo &&
			oldOrganization.logo &&
			data.logo !== oldOrganization.logo
		) {
			this.storageService.deleteFile(oldOrganization.logo);
		}
		return updatedOrganization;
	}

	async delete(organizationId: string, userId: string): Promise<void> {
		await this.ensureRole(organizationId, userId, ["OWNER"]);
		const organization =
			await this.organizationRepository.findById(organizationId);
		if (!organization) {
			throw new HTTPException(404, { message: "Organization not found" });
		}
		await this.organizationRepository.delete(organizationId);
		if (organization.logo) {
			this.storageService.deleteFile(organization.logo);
		}
	}

	async inviteMember(
		organizationId: string,
		inviterId: string,
		data: InviteMemberSchema,
	) {
		await this.ensureRole(organizationId, inviterId, ["OWNER", "ADMIN"]);

		const userToInvite = await this.authRepository.findByEmail(data.email);

		// Case 1: User exists - Invite to organization
		if (userToInvite) {
			const existingMember = await this.organizationRepository.findMember(
				organizationId,
				userToInvite.id,
			);
			if (existingMember) {
				throw new HTTPException(409, {
					message: "User is already a member of this organization",
				});
			}
			await this.organizationRepository.addMember({
				organizationId,
				userId: userToInvite.id,
				role: data.role,
				status: "PENDING",
			});

			const payload: JwtPayload = {
				id: userToInvite.id,
				email: userToInvite.email,
				organizationId,
				purpose: "invitation",
			};
			const token = await this.tokenHelper.generate(payload);

			if (env.APP_ENV === "development") {
				return { token };
			}

			this.emailHelper.sendInvitationEmail(userToInvite.email, token);
			return;
		}

		// Case 2: User does not exist - Send registration invitation
		const existingInvitation =
			await this.organizationRepository.findInvitationByEmail(
				organizationId,
				data.email,
			);

		if (existingInvitation) {
			// Optionally update the existing invitation or just resend the email.
			// For now, let's treat it as a conflict or just resend.
			// Let's just create a new one for simplicity or throw error.
			// Throwing error for now to avoid spam.
			throw new HTTPException(409, {
				message: "Invitation already sent to this email",
			});
		}

		const token = crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

		await this.organizationRepository.createInvitation({
			organizationId,
			email: data.email,
			role: data.role,
			token,
			expiresAt,
		});

		if (env.APP_ENV === "development") {
			return { token };
		}

		this.emailHelper.sendinvitationRegisterEmail(data.email, token);
		return;
	}

	async acceptInvitation(
		auth: JwtPayload,
		organizationId: string,
	): Promise<void> {
		const user = await this.authRepository.findById(auth.id);
		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}
		const member = await this.organizationRepository.findMember(
			organizationId,
			auth.id,
		);
		if (!member) {
			throw new HTTPException(404, { message: "Member record not found" });
		}
		console.log(member);
		if (member.status === "ACCEPTED") {
			throw new HTTPException(400, { message: "Invitation already accepted" });
		}
		await this.organizationRepository.updateMember(member.id, {
			status: "ACCEPTED",
		});
	}

	async getMembers(
		organizationId: string,
		userId: string,
	): Promise<OrganizationMemberWithUser[]> {
		const organization =
			await this.organizationRepository.findById(organizationId);
		if (!organization) {
			throw new HTTPException(404, { message: "Organization not found" });
		}
		const member = await this.organizationRepository.findMember(
			organizationId,
			userId,
		);
		if (!member) {
			throw new HTTPException(403, { message: "Forbidden" });
		}
		return await this.organizationRepository.findMembers(organizationId);
	}

	async updateMemberRole(
		organizationId: string,
		modifierId: string,
		memberId: string,
		data: UpdateMemberRoleSchema,
	): Promise<OrganizationMember> {
		const modifierRole = await this.ensureRole(organizationId, modifierId, [
			"OWNER",
			"ADMIN",
		]);
		const targetMember =
			await this.organizationRepository.findMemberById(memberId);
		if (!targetMember) {
			throw new HTTPException(404, { message: "Member not found" });
		}
		if (targetMember.organizationId !== organizationId) {
			throw new HTTPException(400, {
				message: "Member does not belong to this organization",
			});
		}
		if (data.role === "OWNER") {
			if (modifierRole !== "OWNER") {
				throw new HTTPException(403, {
					message:
						"Only OWNER can promote others to OWNER (Transfer Ownership)",
				});
			}
			throw new HTTPException(400, {
				message: "Transfer ownership is not supported via this endpoint yet.",
			});
		}
		if (modifierRole === "ADMIN") {
			if (targetMember.role === "OWNER") {
				throw new HTTPException(403, {
					message: "ADMIN cannot modify OWNER role",
				});
			}
			if (targetMember.role === "ADMIN" && targetMember.userId !== modifierId) {
				throw new HTTPException(403, {
					message: "ADMIN can only manage MEMBER roles",
				});
			}
		}
		return await this.organizationRepository.updateMember(memberId, data);
	}

	async removeMember(
		organizationId: string,
		removerId: string,
		memberId: string,
	): Promise<void> {
		const removerRole = await this.ensureRole(organizationId, removerId, [
			"OWNER",
			"ADMIN",
		]);
		const targetMember =
			await this.organizationRepository.findMemberById(memberId);
		if (!targetMember) {
			throw new HTTPException(404, { message: "Member not found" });
		}
		if (targetMember.organizationId !== organizationId) {
			throw new HTTPException(400, {
				message: "Member does not belong to this organization",
			});
		}
		if (targetMember.role === "OWNER") {
			throw new HTTPException(403, { message: "Cannot remove OWNER" });
		}
		if (removerRole === "ADMIN") {
			if (targetMember.role === "ADMIN") {
				throw new HTTPException(403, {
					message: "ADMIN cannot remove other ADMIN",
				});
			}
		}
		await this.organizationRepository.removeMember(memberId);
	}
}

const organizationService = OrganizationService.instance;
export default organizationService;
