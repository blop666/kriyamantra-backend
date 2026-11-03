import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

function getSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  return globalForDb.sql ?? (globalForDb.sql = postgres(process.env.DATABASE_URL, { prepare: false }));
}

export function getDb() {
  return drizzle(getSql());
}
