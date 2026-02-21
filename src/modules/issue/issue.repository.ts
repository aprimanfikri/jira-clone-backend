import { eq } from "drizzle-orm";
import database from "@/database/client";
import type {
	Issue,
	IssueCreateInput,
	IssueUpdateInput,
} from "@/database/schemas";
import { issues } from "@/database/schemas";

export type IssueWithUsers = Issue & {
	assignee: {
		id: string;
		name: string;
		email: string;
		image: string | null;
	} | null;
	reporter: { id: string; name: string; email: string; image: string | null };
};

class IssueRepository {
	private static _instance: IssueRepository;
	private readonly database: typeof database;

	private constructor() {
		this.database = database;
	}

	static get instance() {
		if (!IssueRepository._instance) {
			IssueRepository._instance = new IssueRepository();
		}
		return IssueRepository._instance;
	}

	async create(data: IssueCreateInput): Promise<Issue> {
		const [issue] = await this.database.insert(issues).values(data).returning();
		return issue;
	}

	async findById(id: string): Promise<IssueWithUsers | null> {
		const issue = await this.database.query.issues.findFirst({
			where: (issues, { eq }) => eq(issues.id, id),
			with: {
				assignee: {
					columns: { id: true, name: true, email: true, image: true },
				},
				reporter: {
					columns: { id: true, name: true, email: true, image: true },
				},
				project: {
					columns: { id: true, name: true, key: true },
				},
			},
		});
		return issue ?? null;
	}

	async findByKey(key: string): Promise<IssueWithUsers | null> {
		const issue = await this.database.query.issues.findFirst({
			where: (issues, { eq }) => eq(issues.key, key),
			with: {
				assignee: {
					columns: { id: true, name: true, email: true, image: true },
				},
				reporter: {
					columns: { id: true, name: true, email: true, image: true },
				},
				project: {
					columns: { id: true, name: true, key: true },
				},
			},
		});
		return issue ?? null;
	}

	async findByProjectId(projectId: string): Promise<IssueWithUsers[]> {
		return await this.database.query.issues.findMany({
			where: (issues, { eq }) => eq(issues.projectId, projectId),
			with: {
				assignee: {
					columns: { id: true, name: true, email: true, image: true },
				},
				reporter: {
					columns: { id: true, name: true, email: true, image: true },
				},
			},
			orderBy: (issues, { asc }) => [asc(issues.order)],
		});
	}

	async getMaxOrder(
		projectId: string,
		status: Issue["status"],
	): Promise<number> {
		const result = await this.database.query.issues.findMany({
			where: (issues, { and, eq }) =>
				and(eq(issues.projectId, projectId), eq(issues.status, status)),
			orderBy: (issues, { desc }) => [desc(issues.order)],
			limit: 1,
		});
		return result.length > 0 ? result[0].order : -1;
	}

	async update(id: string, data: IssueUpdateInput): Promise<Issue> {
		const [updated] = await this.database
			.update(issues)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(issues.id, id))
			.returning();
		return updated;
	}

	async delete(id: string): Promise<void> {
		await this.database.delete(issues).where(eq(issues.id, id));
	}
}

const issueRepository = IssueRepository.instance;
export default issueRepository;
