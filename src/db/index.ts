import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Supabase's connection pooler (transaction mode) doesn't support prepared statements
const client = postgres(process.env.POSTGRES_URL!, { prepare: false });

export const db = drizzle(client, { schema });
