ALTER TABLE "workshops"
ADD COLUMN "hours_text" TEXT,
ADD COLUMN "source_name" TEXT DEFAULT 'Google Maps',
ADD COLUMN "external_place_id" TEXT,
ADD COLUMN "listing_types" TEXT[] DEFAULT ARRAY[]::TEXT[];
