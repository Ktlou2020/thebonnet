DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'workshops'
      AND column_name = 'hours_text'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'workshops'
      AND column_name = 'hoursText'
  ) THEN
    ALTER TABLE "workshops" RENAME COLUMN "hours_text" TO "hoursText";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'workshops'
      AND column_name = 'source_name'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'workshops'
      AND column_name = 'sourceName'
  ) THEN
    ALTER TABLE "workshops" RENAME COLUMN "source_name" TO "sourceName";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'workshops'
      AND column_name = 'external_place_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'workshops'
      AND column_name = 'externalPlaceId'
  ) THEN
    ALTER TABLE "workshops" RENAME COLUMN "external_place_id" TO "externalPlaceId";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'workshops'
      AND column_name = 'listing_types'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'workshops'
      AND column_name = 'listingTypes'
  ) THEN
    ALTER TABLE "workshops" RENAME COLUMN "listing_types" TO "listingTypes";
  END IF;
END $$;

ALTER TABLE "workshops"
  ADD COLUMN IF NOT EXISTS "hoursText" TEXT,
  ADD COLUMN IF NOT EXISTS "sourceName" TEXT DEFAULT 'Google Maps',
  ADD COLUMN IF NOT EXISTS "externalPlaceId" TEXT,
  ADD COLUMN IF NOT EXISTS "listingTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];
