import { eq, sql } from "drizzle-orm";
import database from "@/database/client";
import type {
	Project,
	ProjectCreateInput,
	ProjectUpdateInput,
} from "@/database/schemas";
import { projects } from "@/database/schemas";

class ProjectRepository {
	private static _instance: ProjectRepository;
	private readonly database: typeof database;

	private constructor() {
		this.database = database;
	}

	static get instance() {
		if (!ProjectRepository._instance) {
			ProjectRepository._instance = new ProjectRepository();
		}
		return ProjectRepository._instance;
	}

	async create(data: ProjectCreateInput): Promise<Project> {
		const [project] = await this.database
			.insert(projects)
			.values({ ...data, issueCount: 0 })
			.returning();
		return project;
	}

	async findAll(): Promise<Project[]> {
		return await this.database.query.projects.findMany({
			orderBy: (projects, { asc }) => [asc(projects.createdAt)],
		});
	}

	async findById(id: string): Promise<Project | null> {
		const project = await this.database.query.projects.findFirst({
			where: (projects, { eq }) => eq(projects.id, id),
		});
		return project ?? null;
	}

	async findByKey(key: string): Promise<Project | null> {
		const project = await this.database.query.projects.findFirst({
			where: (projects, { eq }) => eq(projects.key, key),
		});
		return project ?? null;
	}

	async update(id: string, data: ProjectUpdateInput): Promise<Project> {
		const [updated] = await this.database
			.update(projects)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(projects.id, id))
			.returning();
		return updated;
	}

	async incrementIssueCount(id: string): Promise<number> {
		const [project] = await this.database
			.update(projects)
			.set({
				issueCount: sql`issue_count + 1`,
				updatedAt: new Date(),
			})
			.where(eq(projects.id, id))
			.returning();
		return project.issueCount;
	}

	async delete(id: string): Promise<void> {
		await this.database.delete(projects).where(eq(projects.id, id));
	}
}

const projectRepository = ProjectRepository.instance;
export default projectRepository;
