DO $$ BEGIN
  ALTER TABLE "profiles" ADD COLUMN "passwordHash" TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;
