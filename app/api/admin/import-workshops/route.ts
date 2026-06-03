import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/db";

const CITY_TO_PROVINCE: Record<string, string> = {
  "Cape Town": "Western Cape",
  "Johannesburg": "Gauteng",
  "Pretoria": "Gauteng",
  "Durban": "KwaZulu-Natal",
  "Port Elizabeth": "Eastern Cape",
  "Bloemfontein": "Free State",
  "Nelspruit": "Mpumalanga",
  "Polokwane": "Limpopo",
  "East London": "Eastern Cape",
  "Sandton": "Gauteng",
};

const VALID_CITIES = Object.keys(CITY_TO_PROVINCE);

function slugify(name: string, city: string): string {
  const nameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  const citySlug = city
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `${nameSlug}-${citySlug}`;
}

function mapListingTypes(types: string[] = []): string[] {
  if (types.includes("car_repair")) return ["Car Repair"];
  if (types.includes("car_wash")) return ["Car Wash"];
  return ["General Service"];
}

const DAY_MAP: Record<string, string> = {
  Monday: "mon",
  Tuesday: "tue",
  Wednesday: "wed",
  Thursday: "thu",
  Friday: "fri",
  Saturday: "sat",
  Sunday: "sun",
};

function parseOpeningHours(weekdayText: string[] = []): Record<string, string> | null {
  const hours: Record<string, string> = {};
  for (const line of weekdayText) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const dayName = line.slice(0, colonIdx).trim();
    const timesPart = line.slice(colonIdx + 1).trim();
    const key = DAY_MAP[dayName];
    if (!key) continue;
    hours[key] = timesPart.toLowerCase() === "closed" ? "Closed" : timesPart;
  }
  return Object.keys(hours).length > 0 ? hours : null;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTextSearch(
  query: string,
  apiKey: string,
  pageToken?: string
): Promise<{ results: PlaceResult[]; next_page_token?: string; status: string }> {
  let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
  if (pageToken) url += `&pagetoken=${encodeURIComponent(pageToken)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TextSearch HTTP error: ${res.status}`);
  return res.json();
}

async function fetchPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<{ result: PlaceDetail; status: string }> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,photos,geometry,rating,user_ratings_total,types&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PlaceDetails HTTP error: ${res.status}`);
  return res.json();
}

interface PlaceResult {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
}

interface PlaceDetail {
  name?: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: { weekday_text?: string[] };
  geometry?: { location?: { lat?: number; lng?: number } };
  rating?: number;
  types?: string[];
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY is not configured" }, { status: 500 });
  }

  let body: { city?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const city = body.city?.trim() ?? "";
  if (!city || !VALID_CITIES.includes(city)) {
    return NextResponse.json(
      { error: `Invalid city. Must be one of: ${VALID_CITIES.join(", ")}` },
      { status: 400 }
    );
  }

  // Ensure system profile exists
  const systemProfile = await prisma.profile.upsert({
    where: { email: "system@thebonnet.co.za" },
    update: {},
    create: {
      email: "system@thebonnet.co.za",
      fullName: "The Bonnet System",
      role: "ADMIN",
    },
  });

  const SEARCH_QUERIES = [
    `mechanic workshop ${city} South Africa`,
    `auto repair ${city} South Africa`,
    `car service centre ${city} South Africa`,
  ];

  const seen = new Set<string>();
  const qualifying: PlaceResult[] = [];

  for (const query of SEARCH_QUERIES) {
    let pageToken: string | undefined;
    let page = 0;
    while (page < 3) {
      if (pageToken) await delay(2000);
      let data;
      try {
        data = await fetchTextSearch(query, apiKey, pageToken);
      } catch {
        break;
      }
      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") break;
      for (const place of data.results ?? []) {
        if (seen.has(place.place_id)) continue;
        seen.add(place.place_id);
        if ((place.rating ?? 0) >= 4.0 && (place.user_ratings_total ?? 0) >= 10) {
          qualifying.push(place);
        }
      }
      pageToken = data.next_page_token;
      page++;
      if (!pageToken) break;
    }
  }

  let imported = 0;
  let skipped = 0;
  const province = CITY_TO_PROVINCE[city] ?? "";

  for (const place of qualifying) {
    await delay(200);
    try {
      const detailsRes = await fetchPlaceDetails(place.place_id, apiKey);
      if (detailsRes.status !== "OK") {
        skipped++;
        continue;
      }
      const d = detailsRes.result;
      const name = d.name ?? place.name;
      const slug = slugify(name, city);
      const description = `${name} is a top-rated auto workshop in ${city}, South Africa.`;
      const listingTypes = mapListingTypes(d.types ?? []);
      const openingHours = parseOpeningHours(d.opening_hours?.weekday_text ?? []);
      const lat = d.geometry?.location?.lat ?? null;
      const lng = d.geometry?.location?.lng ?? null;

      await prisma.workshop.upsert({
        where: { slug },
        update: {
          name,
          description,
          city,
          province,
          addressLine1: d.formatted_address ?? null,
          phone: d.formatted_phone_number ?? null,
          website: d.website ?? null,
          latitude: lat,
          longitude: lng,
          ratingAverage: d.rating ?? 0,
          externalPlaceId: place.place_id,
          sourceName: "Google Places",
          status: "VERIFIED",
          listingTypes,
          openingHours: openingHours ?? undefined,
        },
        create: {
          ownerId: systemProfile.id,
          name,
          slug,
          description,
          city,
          province,
          addressLine1: d.formatted_address ?? null,
          phone: d.formatted_phone_number ?? null,
          website: d.website ?? null,
          latitude: lat,
          longitude: lng,
          ratingAverage: d.rating ?? 0,
          externalPlaceId: place.place_id,
          sourceName: "Google Places",
          status: "VERIFIED",
          listingTypes,
          openingHours: openingHours ?? undefined,
        },
      });
      imported++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ imported, skipped });
}
