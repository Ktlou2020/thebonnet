CREATE TABLE IF NOT EXISTS "admin_notes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "authorId" UUID,
  "leadId" UUID,
  "workshopId" UUID,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_notes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "admin_notes_leadId_createdAt_idx" ON "admin_notes"("leadId", "createdAt");
CREATE INDEX IF NOT EXISTS "admin_notes_workshopId_createdAt_idx" ON "admin_notes"("workshopId", "createdAt");
CREATE INDEX IF NOT EXISTS "admin_notes_authorId_createdAt_idx" ON "admin_notes"("authorId", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_notes_authorId_fkey'
  ) THEN
    ALTER TABLE "admin_notes"
      ADD CONSTRAINT "admin_notes_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "admin_users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_notes_leadId_fkey'
  ) THEN
    ALTER TABLE "admin_notes"
      ADD CONSTRAINT "admin_notes_leadId_fkey"
      FOREIGN KEY ("leadId") REFERENCES "leads"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_notes_workshopId_fkey'
  ) THEN
    ALTER TABLE "admin_notes"
      ADD CONSTRAINT "admin_notes_workshopId_fkey"
      FOREIGN KEY ("workshopId") REFERENCES "workshops"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
