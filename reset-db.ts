import db from "./src/database/client";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Dropping all tables and enums...");
  try {
    // Drop tables
    await db.execute(sql`DROP TABLE IF EXISTS "subtasks" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "issues" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "projects" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "users" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE`);

    // Drop enums
    await db.execute(sql`DROP TYPE IF EXISTS "issue_priority" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "issue_status" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "issue_type" CASCADE`);

    console.log("Database reset successfully.");
  } catch (e) {
    console.error("Error resetting database:", e);
  }
  process.exit(0);
}

main();
