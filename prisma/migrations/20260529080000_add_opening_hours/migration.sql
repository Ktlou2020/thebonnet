DO $$ BEGIN
  ALTER TABLE "workshops" ADD COLUMN "openingHours" JSONB;
EXCEPTION WHEN duplicate_column THEN null; END $$;
