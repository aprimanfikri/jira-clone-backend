import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import app from "@/app";
import { env } from "@/config/env";

async function runDatabaseMigrations() {
	console.log("🔄 Running database migrations...");

	try {
		const migrationPool = new Pool({
			connectionString: env.DATABASE_URL,
			max: 1,
		});

		const db = drizzle(migrationPool);

		await migrate(db, {
			migrationsFolder: "./drizzle",
		});

		await migrationPool.end();

		console.log("✅ Database migrations completed successfully");
	} catch (error) {
		console.error("❌ Database migration failed:", error);
		console.log("⚠️ Continuing without migrations...");
	}
}

// async function runDatabaseSeed() {
//   const databaseUrl = process.env.DATABASE_URL;

//   if (!databaseUrl) {
//     console.log("⚠️ DATABASE_URL not set, skipping seeding");
//     return;
//   }

//   console.log("🌱 Running database seeding...");

//   try {
//     await seed();
//   } catch (error) {
//     console.error("❌ Database seeding failed:", error);
//     console.log("⚠️ Continuing without seeding...");
//   }
// }

async function startServer() {
	await runDatabaseMigrations();
	//   await runDatabaseSeed();

	const server = Bun.serve({
		port: env.PORT,
		fetch: app.fetch,
	});

	console.log(`🚀 Server running at port: ${env.PORT}`);
	console.log(`📡 URL: http://localhost:${env.PORT}`);

	return server;
}

process.on("SIGINT", () => {
	console.log("Shutting down...");
	process.exit(0);
});

process.on("SIGTERM", () => {
	console.log("Shutting down...");
	process.exit(0);
});

startServer().catch((error) => {
	console.error("Failed to start server:", error);
	process.exit(1);
});
