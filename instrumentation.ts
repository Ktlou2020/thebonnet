/**
 * Next.js instrumentation hook — runs once per server process at startup,
 * before any requests are handled.
 *
 * We use this to apply pending Prisma migrations so the database schema is
 * always in sync with the Prisma client before any queries are made.
 * This prevents P2022 "column does not exist" errors caused by migrations
 * that were not yet applied when the app started.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run migrations in the Node.js runtime (not in the Edge runtime).
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { runMigrations } = await import("@/lib/db-migrate");
    runMigrations();
  }
}
