import { Pool } from "pg";
import { env } from "./src/config/env";

async function dropTable() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 1,
  });

  try {
    console.log(
      "🗑️ Dropping 'subtasks' table to resolve migration conflict...",
    );
    await pool.query('DROP TABLE IF EXISTS "subtasks" CASCADE;');
    console.log("✅ Table dropped successfully.");
  } catch (error) {
    console.error("❌ Failed to drop table:", error);
  } finally {
    await pool.end();
  }
}

dropTable();
