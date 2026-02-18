import { eq } from "drizzle-orm";
import database from "@/database/client";
import {
	type Organization,
	type OrganizationCreateInput,
	type OrganizationInvitation,
	type OrganizationInvitationCreateInput,
	type OrganizationMember,
	type OrganizationMemberCreateInput,
	type OrganizationMemberUpdateInput,
	type OrganizationUpdateInput,
	organizationInvitations,
	organizationMembers,
	organizations,
} from "@/database/schemas";
import type {
	OrganizationMemberWithUser,
	OrganizationWithOwner,
} from "@/types";

class OrganizationRepository {
	private static _instance: OrganizationRepository;
	private readonly db: typeof database;

	private constructor() {
		this.db = database;
	}

	static get instance() {
		if (!OrganizationRepository._instance) {
			OrganizationRepository._instance = new OrganizationRepository();
		}
		return OrganizationRepository._instance;
	}

	async create(
		data: OrganizationCreateInput,
		tx?: Parameters<Parameters<typeof database.transaction>[0]>[0],
	): Promise<Organization> {
		const db = tx ?? this.db;
		const [organization] = await db
			.insert(organizations)
			.values(data)
			.returning();
		return organization;
	}

	async createWithInitialOwner(
		organizationData: OrganizationCreateInput,
		ownerId: string,
	): Promise<Organization> {
		return await this.db.transaction(async (tx) => {
			const organization = await this.create(organizationData, tx);
			await this.addMember(
				{
					organizationId: organization.id,
					userId: ownerId,
					role: "OWNER",
					status: "ACCEPTED",
				},
				tx,
			);
			return organization;
		});
	}

	async findById(id: string): Promise<OrganizationWithOwner | null> {
		const organization = await this.db.query.organizations.findFirst({
			where: (organizations, { eq }) => eq(organizations.id, id),
			with: {
				owner: {
					columns: {
						id: true,
						name: true,
						email: true,
						image: true,
						isEmailVerified: true,
						createdAt: true,
						updatedAt: true,
					},
				},
			},
		});
		return organization ?? null;
	}

	async findBySlug(slug: string): Promise<OrganizationWithOwner | null> {
		const organization = await this.db.query.organizations.findFirst({
			where: (organizations, { eq }) => eq(organizations.slug, slug),
			with: {
				owner: {
					columns: {
						id: true,
						name: true,
						email: true,
						image: true,
						isEmailVerified: true,
						createdAt: true,
						updatedAt: true,
					},
				},
			},
		});
		return organization ?? null;
	}

	async update(
		id: string,
		data: OrganizationUpdateInput,
	): Promise<Organization> {
		const [organization] = await this.db
			.update(organizations)
			.set(data)
			.where(eq(organizations.id, id))
			.returning();
		return organization;
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(organizations).where(eq(organizations.id, id));
	}

	async addMember(
		data: OrganizationMemberCreateInput,
		tx?: Parameters<Parameters<typeof database.transaction>[0]>[0],
	): Promise<OrganizationMember> {
		const db = tx ?? this.db;
		const [member] = await db
			.insert(organizationMembers)
			.values(data)
			.returning();
		return member;
	}

	async findMember(
		organizationId: string,
		userId: string,
	): Promise<OrganizationMember | null> {
		const member = await this.db.query.organizationMembers.findFirst({
			where: (members, { and, eq }) =>
				and(
					eq(members.organizationId, organizationId),
					eq(members.userId, userId),
				),
		});
		return member ?? null;
	}

	async findMembers(
		organizationId: string,
	): Promise<OrganizationMemberWithUser[]> {
		return await this.db.query.organizationMembers.findMany({
			where: (members, { eq }) => eq(members.organizationId, organizationId),
			with: {
				user: {
					columns: {
						id: true,
						name: true,
						email: true,
						image: true,
						isEmailVerified: true,
						createdAt: true,
						updatedAt: true,
					},
				},
			},
		});
	}

	async updateMember(
		id: string,
		data: OrganizationMemberUpdateInput,
	): Promise<OrganizationMember> {
		const [member] = await this.db
			.update(organizationMembers)
			.set(data)
			.where(eq(organizationMembers.id, id))
			.returning();
		return member;
	}

	async removeMember(id: string): Promise<void> {
		await this.db
			.delete(organizationMembers)
			.where(eq(organizationMembers.id, id));
	}

	async findMemberById(id: string): Promise<OrganizationMember | null> {
		const member = await this.db.query.organizationMembers.findFirst({
			where: (members, { eq }) => eq(members.id, id),
			with: {
				user: true,
			},
		});
		return member ?? null;
	}

	async findOrganizationsByUserId(userId: string): Promise<Organization[]> {
		const memberships = await this.db.query.organizationMembers.findMany({
			where: (members, { eq }) => eq(members.userId, userId),
			with: {
				organization: true,
			},
		});

		return memberships.map((m) => m.organization) as Organization[];
	}

	// Invitation methods
	async createInvitation(
		data: OrganizationInvitationCreateInput,
	): Promise<OrganizationInvitation> {
		const [invitation] = await this.db
			.insert(organizationInvitations)
			.values(data)
			.returning();
		return invitation;
	}

	async findInvitationByToken(
		token: string,
	): Promise<OrganizationInvitation | null> {
		const invitation = await this.db.query.organizationInvitations.findFirst({
			where: (invitations, { eq }) => eq(invitations.token, token),
			with: {
				organization: true,
			},
		});
		return invitation ?? null;
	}

	async findInvitationByEmail(
		organizationId: string,
		email: string,
	): Promise<OrganizationInvitation | null> {
		const invitation = await this.db.query.organizationInvitations.findFirst({
			where: (invitations, { and, eq }) =>
				and(
					eq(invitations.organizationId, organizationId),
					eq(invitations.email, email),
				),
		});
		return invitation ?? null;
	}

	async deleteInvitation(id: string): Promise<void> {
		await this.db
			.delete(organizationInvitations)
			.where(eq(organizationInvitations.id, id));
	}
}

const organizationRepository = OrganizationRepository.instance;
export default organizationRepository;
