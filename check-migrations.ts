import db from "./src/database/client";
import { sql } from "drizzle-orm";

async function main() {
  try {
    const result = await db.execute(sql`SELECT * FROM __drizzle_migrations`);
    console.log("Migrations:", result.rows);
  } catch (e) {
    console.error("Error fetching migrations:", e);
  }
  process.exit(0);
}

main();
