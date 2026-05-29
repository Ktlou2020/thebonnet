-- CreateEnum (safe)
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('DRIVER', 'WORKSHOP_OWNER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Extend LeadStatus if needed
DO $$ BEGIN
  ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'RESPONDED';
  ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'ACCEPTED';
  ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'DECLINED';
  ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';
EXCEPTION WHEN others THEN null; END $$;

-- Add new columns to profiles
DO $$ BEGIN
  ALTER TABLE "profiles" ADD COLUMN "userRole" "UserRole" NOT NULL DEFAULT 'DRIVER';
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "profiles" ADD COLUMN "emailVerified" TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "profiles" ADD COLUMN "image" TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "profiles" ADD COLUMN "bonnetPlusUntil" TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- Auth.js tables
CREATE TABLE IF NOT EXISTS "accounts" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "provider_account_id" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "accounts_provider_provider_account_id_key" UNIQUE ("provider", "provider_account_id")
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "session_token" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_session_token_key" ON "sessions"("session_token");

CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "verification_tokens_identifier_token_key" UNIQUE ("identifier", "token")
);

-- Vehicles
CREATE TABLE IF NOT EXISTS "vehicles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "profileId" UUID NOT NULL,
  "make" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "variant" TEXT,
  "colour" TEXT,
  "nickname" TEXT,
  "registrationNo" TEXT,
  "vinNumber" TEXT,
  "purchaseDate" TIMESTAMPTZ,
  "currentMileage" INTEGER,
  "imageUrl" TEXT,
  "notes" TEXT,
  "isArchived" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "vehicles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "vehicles_profileId_idx" ON "vehicles"("profileId");

-- Service records
CREATE TABLE IF NOT EXISTS "service_records" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "vehicleId" UUID NOT NULL,
  "serviceType" TEXT NOT NULL,
  "date" TIMESTAMPTZ NOT NULL,
  "mileageAtService" INTEGER,
  "workshopName" TEXT,
  "city" TEXT,
  "labourCents" INTEGER,
  "partsCents" INTEGER,
  "totalCostCents" INTEGER,
  "notes" TEXT,
  "receiptUrl" TEXT,
  "leadId" UUID,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "service_records_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "service_records_vehicleId_date_idx" ON "service_records"("vehicleId", "date");

-- AI diagnoses
CREATE TABLE IF NOT EXISTS "ai_diagnoses" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "profileId" UUID,
  "vehicleId" UUID,
  "vehicleMake" TEXT NOT NULL,
  "vehicleModel" TEXT NOT NULL,
  "vehicleYear" INTEGER,
  "issueDescription" TEXT NOT NULL,
  "aiResponse" JSONB NOT NULL,
  "tokensUsed" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "ai_diagnoses_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ai_diagnoses_profileId_createdAt_idx" ON "ai_diagnoses"("profileId", "createdAt");

-- User XP
CREATE TABLE IF NOT EXISTS "user_xp" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "profileId" UUID NOT NULL UNIQUE,
  "totalXp" INTEGER NOT NULL DEFAULT 0,
  "level" INTEGER NOT NULL DEFAULT 1,
  "badges" JSONB NOT NULL DEFAULT '[]',
  "streakDays" INTEGER NOT NULL DEFAULT 0,
  "lastActivity" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "user_xp_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Maintenance reminders
CREATE TABLE IF NOT EXISTS "maintenance_reminders" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "profileId" UUID NOT NULL,
  "vehicleId" UUID NOT NULL,
  "reminderType" TEXT NOT NULL,
  "dueDate" TIMESTAMPTZ NOT NULL,
  "dueMileage" INTEGER,
  "sent" BOOLEAN NOT NULL DEFAULT false,
  "sentAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "maintenance_reminders_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "maintenance_reminders_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "maintenance_reminders_profileId_dueDate_idx" ON "maintenance_reminders"("profileId", "dueDate");

-- Extend reviews table with new columns
DO $$ BEGIN
  ALTER TABLE "reviews" ADD COLUMN "authorName" TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "reviews" ADD COLUMN "jobType" TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "reviews" ADD COLUMN "costCents" INTEGER;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "reviews" ADD COLUMN "receiptVerified" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "reviews" ADD COLUMN "photoUrls" JSONB NOT NULL DEFAULT '[]';
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "reviews" ADD COLUMN "helpfulCount" INTEGER NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "reviews" ADD COLUMN "reply" TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "reviews" ADD COLUMN "repliedAt" TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "reviews" ADD COLUMN "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING';
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "reviews" ADD COLUMN "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now();
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- Extend quotes table
DO $$ BEGIN
  ALTER TABLE "quotes" ADD COLUMN "workshopMessage" TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "quotes" ADD COLUMN "responseTime" INTEGER;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "quotes" ADD COLUMN "isAccepted" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null; END $$;
