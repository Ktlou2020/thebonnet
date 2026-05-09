CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('CONSUMER', 'MECHANIC_OWNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "WorkshopStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'GROWTH', 'PRO');

-- CreateEnum
CREATE TYPE "AccreditationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'QUALIFIED', 'ASSIGNED', 'CLOSED_WON', 'CLOSED_LOST', 'SPAM');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('SENT', 'VIEWED', 'QUOTED', 'WON', 'LOST', 'EXPIRED');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "phone" TEXT,
    "role" "AppRole" NOT NULL DEFAULT 'CONSUMER',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshops" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ownerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "addressLine1" TEXT,
    "suburb" TEXT,
    "postalCode" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "whatsapp" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "status" "WorkshopStatus" NOT NULL DEFAULT 'PENDING',
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "mobileService" BOOLEAN NOT NULL DEFAULT false,
    "serviceRadiusKm" INTEGER,
    "responseMinutes" INTEGER,
    "hourlyRate" INTEGER,
    "ratingAverage" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "warrantyPolicy" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accreditations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workshopId" UUID NOT NULL,
    "authority" TEXT NOT NULL,
    "membershipNumber" TEXT NOT NULL,
    "status" "AccreditationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accreditations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshop_services" (
    "workshopId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,

    CONSTRAINT "workshop_services_pkey" PRIMARY KEY ("workshopId","categoryId")
);

-- CreateTable
CREATE TABLE "vehicle_makes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_makes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshop_makes" (
    "workshopId" UUID NOT NULL,
    "makeId" UUID NOT NULL,

    CONSTRAINT "workshop_makes_pkey" PRIMARY KEY ("workshopId","makeId")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customerId" UUID,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "city" TEXT,
    "province" TEXT,
    "vehicleMake" TEXT,
    "vehicleModel" TEXT,
    "vehicleYear" INTEGER,
    "vehicleLabel" TEXT NOT NULL,
    "serviceNeeded" TEXT NOT NULL,
    "urgency" TEXT,
    "details" TEXT,
    "preferredDate" TIMESTAMPTZ(6),
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "leadId" UUID NOT NULL,
    "workshopId" UUID NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'SENT',
    "leadPriceCents" INTEGER,
    "assignedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMPTZ(6),
    "respondedAt" TIMESTAMPTZ(6),

    CONSTRAINT "lead_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assignmentId" UUID NOT NULL,
    "labourCents" INTEGER NOT NULL,
    "partsCents" INTEGER NOT NULL,
    "vatCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL,
    "etaText" TEXT,
    "warrantyText" TEXT,
    "notes" TEXT,
    "status" "QuoteStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workshopId" UUID NOT NULL,
    "userId" UUID,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "verifiedJob" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_benchmarks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "serviceCategoryId" UUID NOT NULL,
    "vehicleMakeId" UUID NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "lowCents" INTEGER NOT NULL,
    "independentAvgCents" INTEGER NOT NULL,
    "highCents" INTEGER NOT NULL,
    "dealershipAvgCents" INTEGER NOT NULL,
    "sampleSize" INTEGER NOT NULL DEFAULT 0,
    "confidenceLabel" TEXT NOT NULL DEFAULT 'Medium',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "price_benchmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshop_subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workshopId" UUID NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'manual',
    "externalRef" TEXT,
    "startDate" TIMESTAMPTZ(6) NOT NULL,
    "renewsAt" TIMESTAMPTZ(6),
    "cancelledAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "workshop_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshop_media" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workshopId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workshop_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "workshops_slug_key" ON "workshops"("slug");

-- CreateIndex
CREATE INDEX "workshops_city_province_idx" ON "workshops"("city", "province");

-- CreateIndex
CREATE INDEX "workshops_status_featured_idx" ON "workshops"("status", "featured");

-- CreateIndex
CREATE INDEX "accreditations_workshopId_idx" ON "accreditations"("workshopId");

-- CreateIndex
CREATE UNIQUE INDEX "accreditations_authority_membershipNumber_key" ON "accreditations"("authority", "membershipNumber");

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_name_key" ON "service_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_slug_key" ON "service_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_makes_name_key" ON "vehicle_makes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_makes_slug_key" ON "vehicle_makes"("slug");

-- CreateIndex
CREATE INDEX "leads_status_createdAt_idx" ON "leads"("status", "createdAt");

-- CreateIndex
CREATE INDEX "leads_city_province_idx" ON "leads"("city", "province");

-- CreateIndex
CREATE INDEX "lead_assignments_workshopId_status_idx" ON "lead_assignments"("workshopId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "lead_assignments_leadId_workshopId_key" ON "lead_assignments"("leadId", "workshopId");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_assignmentId_key" ON "quotes"("assignmentId");

-- CreateIndex
CREATE INDEX "quotes_status_createdAt_idx" ON "quotes"("status", "createdAt");

-- CreateIndex
CREATE INDEX "reviews_workshopId_createdAt_idx" ON "reviews"("workshopId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "price_benchmarks_serviceCategoryId_vehicleMakeId_vehicleMod_key" ON "price_benchmarks"("serviceCategoryId", "vehicleMakeId", "vehicleModel", "city");

-- CreateIndex
CREATE UNIQUE INDEX "workshop_subscriptions_workshopId_key" ON "workshop_subscriptions"("workshopId");

-- CreateIndex
CREATE INDEX "workshop_media_workshopId_sortOrder_idx" ON "workshop_media"("workshopId", "sortOrder");

-- AddForeignKey
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accreditations" ADD CONSTRAINT "accreditations_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_services" ADD CONSTRAINT "workshop_services_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_services" ADD CONSTRAINT "workshop_services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_makes" ADD CONSTRAINT "workshop_makes_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_makes" ADD CONSTRAINT "workshop_makes_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "vehicle_makes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_assignments" ADD CONSTRAINT "lead_assignments_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_assignments" ADD CONSTRAINT "lead_assignments_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "lead_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_benchmarks" ADD CONSTRAINT "price_benchmarks_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "service_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_benchmarks" ADD CONSTRAINT "price_benchmarks_vehicleMakeId_fkey" FOREIGN KEY ("vehicleMakeId") REFERENCES "vehicle_makes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_subscriptions" ADD CONSTRAINT "workshop_subscriptions_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_media" ADD CONSTRAINT "workshop_media_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

