import { execSync } from "child_process";

/**
 * Runs `prisma migrate deploy` synchronously at server startup.
 *
 * This ensures any pending migrations (e.g. adding columns that the Prisma
 * schema already references) are applied before the app handles its first
 * request, preventing P2022 "column does not exist" errors caused by a
 * schema/database drift.
 *
 * Called from instrumentation.ts which Next.js executes once per server
 * process before any routes are served.
 */
export function runMigrations(): void {
  if (!process.env.DATABASE_URL) {
    console.log("[db-migrate] DATABASE_URL not set — skipping migration.");
    return;
  }

  console.log("[db-migrate] Running prisma migrate deploy…");

  try {
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      env: process.env,
    });
    console.log("[db-migrate] Migrations applied successfully.");
  } catch (error) {
    // Log the failure but do not crash the process — a failed migration is
    // better surfaced as a runtime query error than a hard startup crash that
    // prevents health-check endpoints from responding.
    console.error("[db-migrate] Migration failed:", error);
  }
}
