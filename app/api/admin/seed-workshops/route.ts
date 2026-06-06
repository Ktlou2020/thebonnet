import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/db";

const CITY_TO_PROVINCE: Record<string, string> = {
  "Cape Town": "Western Cape",
  "Johannesburg": "Gauteng",
  "Pretoria": "Gauteng",
  "Durban": "KwaZulu-Natal",
  "Port Elizabeth": "Eastern Cape",
};

type SeedEntry = {
  name: string;
  city: string;
  listingTypes: string[];
};

const SEED_WORKSHOPS: SeedEntry[] = [
  // Cape Town
  { name: "Midas Cape Town CBD", city: "Cape Town", listingTypes: ["Car Repair", "General Service"] },
  { name: "AutoZone Service Centre Parow", city: "Cape Town", listingTypes: ["Car Repair", "General Service"] },
  { name: "Tiger Wheel & Tyre Claremont", city: "Cape Town", listingTypes: ["Tyres"] },
  { name: "Supa Quick Bellville", city: "Cape Town", listingTypes: ["Tyres"] },
  { name: "Pit Stop Auto Repairs Observatory", city: "Cape Town", listingTypes: ["Car Repair", "General Service"] },
  { name: "Murray's Auto Centre Goodwood", city: "Cape Town", listingTypes: ["Car Repair", "General Service"] },
  { name: "Tiger Wheel & Tyre Kenilworth", city: "Cape Town", listingTypes: ["Tyres"] },
  { name: "Supa Quick Brackenfell", city: "Cape Town", listingTypes: ["Tyres"] },
  { name: "Midas Paarden Eiland", city: "Cape Town", listingTypes: ["Car Repair", "General Service"] },
  { name: "AutoZone Service Centre Kuils River", city: "Cape Town", listingTypes: ["Car Repair", "General Service"] },
  { name: "Cape Auto Clinic Milnerton", city: "Cape Town", listingTypes: ["Car Repair", "General Service"] },
  { name: "Wynberg Auto Repairs", city: "Cape Town", listingTypes: ["Car Repair", "General Service"] },
  { name: "Atlantic Auto Services Tableview", city: "Cape Town", listingTypes: ["Car Repair", "General Service"] },

  // Johannesburg
  { name: "Midas Braamfontein", city: "Johannesburg", listingTypes: ["Car Repair", "General Service"] },
  { name: "AutoZone Service Centre Roodepoort", city: "Johannesburg", listingTypes: ["Car Repair", "General Service"] },
  { name: "Tiger Wheel & Tyre Fourways", city: "Johannesburg", listingTypes: ["Tyres"] },
  { name: "Supa Quick Randburg", city: "Johannesburg", listingTypes: ["Tyres"] },
  { name: "Pit Stop Auto Repairs Melville", city: "Johannesburg", listingTypes: ["Car Repair", "General Service"] },
  { name: "First Stop Tyres Soweto", city: "Johannesburg", listingTypes: ["Tyres"] },
  { name: "Midas Boksburg", city: "Johannesburg", listingTypes: ["Car Repair", "General Service"] },
  { name: "AutoZone Service Centre Kempton Park", city: "Johannesburg", listingTypes: ["Car Repair", "General Service"] },
  { name: "Joburg Auto Clinic Cresta", city: "Johannesburg", listingTypes: ["Car Repair", "General Service"] },
  { name: "Supa Quick Alberton", city: "Johannesburg", listingTypes: ["Tyres"] },
  { name: "Tiger Wheel & Tyre Eastgate", city: "Johannesburg", listingTypes: ["Tyres"] },
  { name: "Rosebank Auto Centre", city: "Johannesburg", listingTypes: ["Car Repair", "General Service"] },
  { name: "Pro-Tech Auto Services Germiston", city: "Johannesburg", listingTypes: ["Car Repair", "General Service"] },

  // Pretoria
  { name: "Midas Menlyn", city: "Pretoria", listingTypes: ["Car Repair", "General Service"] },
  { name: "AutoZone Service Centre Hatfield", city: "Pretoria", listingTypes: ["Car Repair", "General Service"] },
  { name: "Tiger Wheel & Tyre Centurion", city: "Pretoria", listingTypes: ["Tyres"] },
  { name: "Supa Quick Silverton", city: "Pretoria", listingTypes: ["Tyres"] },
  { name: "Pit Stop Auto Repairs Gezina", city: "Pretoria", listingTypes: ["Car Repair", "General Service"] },
  { name: "Midas Lynnwood", city: "Pretoria", listingTypes: ["Car Repair", "General Service"] },
  { name: "Capital City Auto Repairs", city: "Pretoria", listingTypes: ["Car Repair", "General Service"] },
  { name: "Supa Quick Montana", city: "Pretoria", listingTypes: ["Tyres"] },
  { name: "AutoZone Service Centre Garsfontein", city: "Pretoria", listingTypes: ["Car Repair", "General Service"] },
  { name: "Tiger Wheel & Tyre Faerie Glen", city: "Pretoria", listingTypes: ["Tyres"] },
  { name: "Tshwane Automotive Solutions", city: "Pretoria", listingTypes: ["Car Repair", "General Service"] },

  // Durban
  { name: "Midas Pinetown", city: "Durban", listingTypes: ["Car Repair", "General Service"] },
  { name: "AutoZone Service Centre Westville", city: "Durban", listingTypes: ["Car Repair", "General Service"] },
  { name: "Tiger Wheel & Tyre Umhlanga", city: "Durban", listingTypes: ["Tyres"] },
  { name: "Supa Quick Springfield", city: "Durban", listingTypes: ["Tyres"] },
  { name: "Pit Stop Auto Repairs Musgrave", city: "Durban", listingTypes: ["Car Repair", "General Service"] },
  { name: "Midas Chatsworth", city: "Durban", listingTypes: ["Car Repair", "General Service"] },
  { name: "Bay Auto Clinic Berea", city: "Durban", listingTypes: ["Car Repair", "General Service"] },
  { name: "Tiger Wheel & Tyre Amanzimtoti", city: "Durban", listingTypes: ["Tyres"] },
  { name: "AutoZone Service Centre Tongaat", city: "Durban", listingTypes: ["Car Repair", "General Service"] },
  { name: "Supa Quick Hillcrest", city: "Durban", listingTypes: ["Tyres"] },
  { name: "KZN Auto Specialists Overport", city: "Durban", listingTypes: ["Car Repair", "General Service"] },

  // Port Elizabeth
  { name: "Midas Uitenhage Road", city: "Port Elizabeth", listingTypes: ["Car Repair", "General Service"] },
  { name: "AutoZone Service Centre Greenbushes", city: "Port Elizabeth", listingTypes: ["Car Repair", "General Service"] },
  { name: "Tiger Wheel & Tyre Walmer", city: "Port Elizabeth", listingTypes: ["Tyres"] },
  { name: "Supa Quick Newton Park", city: "Port Elizabeth", listingTypes: ["Tyres"] },
  { name: "Pit Stop Auto Repairs Summerstrand", city: "Port Elizabeth", listingTypes: ["Car Repair", "General Service"] },
  { name: "Bay Auto Repairs Mill Park", city: "Port Elizabeth", listingTypes: ["Car Repair", "General Service"] },
  { name: "Midas Korsten", city: "Port Elizabeth", listingTypes: ["Car Repair", "General Service"] },
  { name: "Tiger Wheel & Tyre Motherwell", city: "Port Elizabeth", listingTypes: ["Tyres"] },
  { name: "Supa Quick Dispatch", city: "Port Elizabeth", listingTypes: ["Tyres"] },
  { name: "PE Auto Centre Framesby", city: "Port Elizabeth", listingTypes: ["Car Repair", "General Service"] },
  { name: "Eastern Cape Motor Services", city: "Port Elizabeth", listingTypes: ["Car Repair", "General Service"] },
];

function slugify(name: string, city: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${base}-${citySlug}`;
}

export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const systemProfile = await prisma.profile.upsert({
    where: { email: "system@thebonnet.co.za" },
    update: {},
    create: { email: "system@thebonnet.co.za", fullName: "The Bonnet System", role: "ADMIN" },
  });

  let imported = 0;
  let skipped = 0;

  for (const entry of SEED_WORKSHOPS) {
    const { name, city, listingTypes } = entry;
    const province = CITY_TO_PROVINCE[city] ?? "";
    const slug = slugify(name, city);
    const description = `${name} is a trusted vehicle service workshop in ${city}, South Africa.`;

    try {
      await prisma.workshop.upsert({
        where: { slug },
        create: {
          ownerId: systemProfile.id,
          name,
          slug,
          description,
          city,
          province,
          listingTypes,
          status: "PENDING",
          sourceName: "Seed Data",
        },
        update: {},
      });
      imported++;
    } catch (err) {
      console.error(`[seed-workshops] upsert failed for "${name}" in ${city}:`, err);
      skipped++;
    }
  }

  return NextResponse.json({ imported, skipped });
}
