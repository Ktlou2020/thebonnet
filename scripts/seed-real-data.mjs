import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient, WorkshopStatus, SubscriptionTier } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "..", "data", "real-workshops.json");

function slugify(value) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildDescription(listing) {
  const parts = [
    `${listing.name} is a public workshop listing in ${listing.city}, ${listing.province}.`,
    `Listed business types: ${listing.types.join(", ")}.`,
    `Opening hours shown on source listing: ${listing.hours}.`
  ];

  if (listing.website) {
    parts.push(`Website: ${listing.website}.`);
  }

  return parts.join(" ");
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[seed] DATABASE_URL not set, skipping workshop seed.");
    return;
  }

  const raw = await fs.readFile(dataPath, "utf8");
  const listings = JSON.parse(raw);
  const prisma = new PrismaClient();

  try {
    const importer = await prisma.profile.upsert({
      where: { email: "imports@thebonnet.co.za" },
      update: { fullName: "The Bonnet Imports", phone: "+27 10 500 0000" },
      create: { email: "imports@thebonnet.co.za", fullName: "The Bonnet Imports", phone: "+27 10 500 0000" }
    });

    const categoryMap = new Map();

    for (const listing of listings) {
      for (const service of listing.services) {
        const slug = slugify(service);
        const category = await prisma.serviceCategory.upsert({
          where: { slug },
          update: { name: service },
          create: { name: service, slug }
        });
        categoryMap.set(service, category.id);
      }
    }

    let seeded = 0;

    for (const listing of listings) {
      const workshop = await prisma.workshop.upsert({
        where: { slug: listing.slug },
        update: {
          ownerId: importer.id,
          name: listing.name,
          description: buildDescription(listing),
          city: listing.city,
          province: listing.province,
          addressLine1: listing.address,
          phone: listing.phone || null,
          whatsapp: listing.phone || null,
          website: listing.website || null,
          hoursText: listing.hours || null,
          sourceName: listing.source || "Google Maps",
          externalPlaceId: listing.placeId || null,
          listingTypes: listing.types || [],
          status: WorkshopStatus.VERIFIED,
          subscriptionTier: SubscriptionTier.FREE,
          featured: Boolean(listing.featured),
          mobileService: Boolean(listing.mobile),
          ratingAverage: listing.rating,
          reviewCount: 0,
          warrantyPolicy: null
        },
        create: {
          ownerId: importer.id,
          name: listing.name,
          slug: listing.slug,
          description: buildDescription(listing),
          city: listing.city,
          province: listing.province,
          addressLine1: listing.address,
          phone: listing.phone || null,
          whatsapp: listing.phone || null,
          website: listing.website || null,
          hoursText: listing.hours || null,
          sourceName: listing.source || "Google Maps",
          externalPlaceId: listing.placeId || null,
          listingTypes: listing.types || [],
          status: WorkshopStatus.VERIFIED,
          subscriptionTier: SubscriptionTier.FREE,
          featured: Boolean(listing.featured),
          mobileService: Boolean(listing.mobile),
          ratingAverage: listing.rating,
          reviewCount: 0,
          warrantyPolicy: null
        }
      });

      await prisma.workshopService.deleteMany({ where: { workshopId: workshop.id } });

      if (listing.services.length) {
        await prisma.workshopService.createMany({
          data: listing.services
            .map((service) => categoryMap.get(service))
            .filter(Boolean)
            .map((categoryId) => ({ workshopId: workshop.id, categoryId })),
          skipDuplicates: true
        });
      }

      seeded += 1;
    }

    console.log(`[seed] Seeded ${seeded} workshop listings into Railway PostgreSQL.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[seed] Failed to seed real workshop data.");
  console.error(error);
  process.exit(1);
});
