import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma CLI (migrate, studio, db push) uses DIRECT_URL — session/direct connection.
 * Runtime queries use DATABASE_URL (pooled) via PrismaPg in src/lib/db/prisma.ts.
 * @see web/prismapostgres.md and Supabase Prisma guide
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: env("DIRECT_URL")
  }
});
