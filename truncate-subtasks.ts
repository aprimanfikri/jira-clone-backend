import db from "./src/database/client";
import { subtasks } from "./src/database/schemas/subtask";

async function main() {
  console.log("Truncating subtasks table...");
  await db.delete(subtasks);
  console.log("Done.");
  process.exit(0);
}

main();
