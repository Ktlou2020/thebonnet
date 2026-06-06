import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config();

const prisma = new PrismaClient();

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const CITIES = [
  "Cape Town",
  "Johannesburg",
  "Pretoria",
  "Durban",
  "Port Elizabeth",
  "Bloemfontein",
  "Nelspruit",
  "Polokwane",
  "East London",
  "Sandton",
];

const CITY_TO_PROVINCE = {
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

const SEARCH_QUERIES = [
  (city) => `mechanic workshop ${city} South Africa`,
  (city) => `auto repair ${city} South Africa`,
  (city) => `car service centre ${city} South Africa`,
];

function slugify(name, city) {
  const nameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s]+/g, "-");
  const citySlug = city
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s]+/g, "-");
  return `${nameSlug}-${citySlug}`;
}

function mapListingTypes(types = []) {
  if (types.includes("car_repair")) return ["Car Repair"];
  if (types.includes("car_wash")) return ["Car Wash"];
  return ["General Service"];
}

const DAY_MAP = {
  Monday: "mon",
  Tuesday: "tue",
  Wednesday: "wed",
  Thursday: "thu",
  Friday: "fri",
  Saturday: "sat",
  Sunday: "sun",
};

function parseOpeningHours(weekdayText = []) {
  const hours = {};
  for (const line of weekdayText) {
    // e.g. "Monday: 8:00 AM – 5:00 PM" or "Monday: Closed"
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const dayName = line.slice(0, colonIdx).trim();
    const timesPart = line.slice(colonIdx + 1).trim();
    const key = DAY_MAP[dayName];
    if (!key) continue;
    if (timesPart.toLowerCase() === "closed") {
      hours[key] = "Closed";
    } else {
      hours[key] = timesPart;
    }
  }
  return Object.keys(hours).length > 0 ? hours : null;
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTextSearch(query, pageToken) {
  let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
  if (pageToken) {
    url += `&pagetoken=${encodeURIComponent(pageToken)}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TextSearch HTTP error: ${res.status}`);
  return res.json();
}

async function fetchPlaceDetails(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,photos,geometry,rating,user_ratings_total,types&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PlaceDetails HTTP error: ${res.status}`);
  return res.json();
}

async function getSystemProfile() {
  const email = "system@thebonnet.co.za";
  return prisma.profile.upsert({
    where: { email },
    update: {},
    create: {
      email,
      fullName: "The Bonnet System",
      role: "ADMIN",
    },
  });
}

async function searchCity(city) {
  const seen = new Set();
  const qualifying = [];

  for (const buildQuery of SEARCH_QUERIES) {
    const query = buildQuery(city);
    let pageToken = null;
    let page = 0;

    while (page < 3) {
      // Google requires a short wait before using next_page_token
      if (pageToken) await delay(2000);

      let data;
      try {
        data = await fetchTextSearch(query, pageToken);
      } catch (err) {
        console.error(`  [search error] ${query}: ${err.message}`);
        break;
      }

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.warn(`  [API status] ${data.status} for query: ${query}`);
        break;
      }

      const results = data.results || [];
      for (const place of results) {
        if (seen.has(place.place_id)) continue;
        seen.add(place.place_id);
        if ((place.rating || 0) >= 4.0 && (place.user_ratings_total || 0) >= 10) {
          qualifying.push(place);
        }
      }

      pageToken = data.next_page_token || null;
      page++;
      if (!pageToken) break;
    }
  }

  return qualifying;
}

async function main() {
  if (!GOOGLE_API_KEY) {
    console.error("GOOGLE_PLACES_API_KEY is not set in environment. Aborting.");
    process.exit(1);
  }

  console.log("Getting system profile...");
  const systemProfile = await getSystemProfile();
  console.log(`System profile id: ${systemProfile.id}`);

  let totalImported = 0;

  for (const city of CITIES) {
    console.log(`\n[${city}] Searching...`);
    const qualifying = await searchCity(city);
    console.log(`[${city}] Found ${qualifying.length} qualifying places (4+ stars, 10+ reviews)`);

    let cityImported = 0;
    let citySkipped = 0;

    for (const place of qualifying) {
      await delay(200);

      try {
        const detailsRes = await fetchPlaceDetails(place.place_id);
        if (detailsRes.status !== "OK") {
          console.warn(`  [skip] ${place.name}: details status ${detailsRes.status}`);
          citySkipped++;
          continue;
        }

        const d = detailsRes.result;
        const name = d.name || place.name;
        const slug = slugify(name, city);
        const province = CITY_TO_PROVINCE[city] || "";
        const description = `${name} is a top-rated auto workshop in ${city}, South Africa.`;
        const listingTypes = mapListingTypes(d.types || []);
        const openingHours = parseOpeningHours(d.opening_hours?.weekday_text);
        const lat = d.geometry?.location?.lat ?? null;
        const lng = d.geometry?.location?.lng ?? null;

        await prisma.workshop.upsert({
          where: { slug },
          update: {
            name,
            description,
            city,
            province,
            addressLine1: d.formatted_address || null,
            phone: d.formatted_phone_number || null,
            website: d.website || null,
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
            addressLine1: d.formatted_address || null,
            phone: d.formatted_phone_number || null,
            website: d.website || null,
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

        console.log(`  [upserted] ${name} (${slug})`);
        cityImported++;
      } catch (err) {
        console.error(`  [error] ${place.name}: ${err.message}`);
        citySkipped++;
      }
    }

    console.log(`[${city}] Done — imported/updated: ${cityImported}, skipped: ${citySkipped}`);
    totalImported += cityImported;
  }

  console.log(`\nImport complete. Total upserted: ${totalImported}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
