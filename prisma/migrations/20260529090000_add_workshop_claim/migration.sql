DO $$ BEGIN
  ALTER TABLE "workshops" ADD COLUMN "claimedByProfileId" UUID;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "workshops" ADD COLUMN "claimedAt" TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "workshops" ADD COLUMN "claimToken" TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "workshops_claimToken_key" ON "workshops"("claimToken") WHERE "claimToken" IS NOT NULL;
