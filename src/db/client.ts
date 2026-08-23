import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL 未配置。请在本地或 Vercel 的服务端环境变量中配置 Neon PostgreSQL 连接串。");
  }

  if (!database) {
    const client = postgres(process.env.DATABASE_URL, {
      max: 5,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    database = drizzle(client, { schema });
  }

  return database;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}
