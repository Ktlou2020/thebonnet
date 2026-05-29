DO $$ BEGIN
  ALTER TABLE "workshops" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "workshops" ADD COLUMN "verifiedAt" TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "workshops" ADD COLUMN "verificationNotes" TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "profiles" ADD COLUMN "referralCode" TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "profiles" ADD COLUMN "referredBy" TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

CREATE TABLE IF NOT EXISTS "referrals" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "referrerId" UUID NOT NULL,
  "referredEmail" TEXT NOT NULL,
  "rewardGranted" BOOLEAN NOT NULL DEFAULT false,
  "rewardGrantedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "referrals_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "referrals_referrerId_idx" ON "referrals"("referrerId");
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_referralCode_key" ON "profiles"("referralCode") WHERE "referralCode" IS NOT NULL;
