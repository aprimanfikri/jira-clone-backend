import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/config/env";
import * as schema from "./schemas";

const pool = new Pool({
	connectionString: env.DATABASE_URL,
});

const database = drizzle({ client: pool, schema });

export default database;
