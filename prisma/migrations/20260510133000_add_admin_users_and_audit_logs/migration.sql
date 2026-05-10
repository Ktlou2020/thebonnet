DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole') THEN
    CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'OPERATIONS_ADMIN', 'SUPPORT_ADMIN', 'CONTENT_ADMIN', 'FINANCE_ADMIN');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminUserStatus') THEN
    CREATE TYPE "AdminUserStatus" AS ENUM ('ACTIVE', 'INVITED', 'DISABLED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "admin_users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "AdminRole" NOT NULL DEFAULT 'SUPPORT_ADMIN',
  "status" "AdminUserStatus" NOT NULL DEFAULT 'ACTIVE',
  "lastLoginAt" TIMESTAMPTZ(6),
  "invitedById" UUID,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "actorId" UUID,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "summary" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_email_key" ON "admin_users"("email");
CREATE INDEX IF NOT EXISTS "admin_users_role_status_idx" ON "admin_users"("role", "status");
CREATE INDEX IF NOT EXISTS "admin_audit_logs_entityType_entityId_idx" ON "admin_audit_logs"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "admin_audit_logs_createdAt_idx" ON "admin_audit_logs"("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_users_invitedById_fkey'
  ) THEN
    ALTER TABLE "admin_users"
      ADD CONSTRAINT "admin_users_invitedById_fkey"
      FOREIGN KEY ("invitedById") REFERENCES "admin_users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_audit_logs_actorId_fkey'
  ) THEN
    ALTER TABLE "admin_audit_logs"
      ADD CONSTRAINT "admin_audit_logs_actorId_fkey"
      FOREIGN KEY ("actorId") REFERENCES "admin_users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
