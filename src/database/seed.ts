import database from "./client";
import { users } from "./schemas/user";
import bcryptHelper from "../helpers/bcrypt";

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcryptHelper.hash("Katasandi123");

  await database
    .insert(users)
    .values({
      name: "apriman fikri",
      email: "aprmnfkr@gmail.com",
      password: hashedPassword,
      isEmailVerified: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        name: "apriman fikri",
        password: hashedPassword,
        isEmailVerified: true,
        updatedAt: new Date(),
      },
    });

  console.log("Seed complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
