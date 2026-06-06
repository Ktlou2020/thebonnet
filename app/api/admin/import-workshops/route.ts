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

// ---------------------------------------------------------------------------
// Scraper-based import (no API key required)
// ---------------------------------------------------------------------------

interface ScrapedWorkshop {
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  source: string;
}

function scraperSlugify(name: string, city: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${base}-${citySlug}`;
}

function normaliseScraperPhone(raw: string | null): string | null {
  if (!raw) return null;
  let digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (digits.startsWith("27") && digits.length >= 11) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 10) digits = digits.slice(1);
  if (digits.length !== 9) return raw.trim();
  return `+27 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

async function fetchScraperPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-ZA,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (res.status === 200) return res.text();
    return null;
  } catch {
    return null;
  }
}

function normaliseName(name: string): string {
  const trimmed = name.trim();
  if (trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
    return trimmed
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  return trimmed;
}

async function scrapeYellowPagesForCity(city: string): Promise<ScrapedWorkshop[]> {
  const results: ScrapedWorkshop[] = [];
  const { load } = await import("cheerio");
  for (const q of ["mechanic+workshop", "auto+repair"]) {
    const url = `https://www.yellowpages.co.za/search?q=${q}&l=${encodeURIComponent(city)}`;
    const html = await fetchScraperPage(url);
    if (!html) continue;
    const $ = load(html);
    const containers = [".listing", ".result", "[data-listing]", ".business-listing", "article"];
    let $items = $() as ReturnType<typeof $>;
    for (const sel of containers) {
      $items = $(sel);
      if ($items.length > 0) break;
    }
    $items.each((_, el) => {
      const $el = $(el);
      let name = "";
      for (const s of [".listing-name", "h2 a", "h3 a", ".name a", "h2", "h3"]) {
        const t = $el.find(s).first().text().trim();
        if (t) { name = normaliseName(t); break; }
      }
      if (!name) return;
      let address: string | null = null;
      for (const s of [".address", ".location", "[itemprop='address']"]) {
        const t = $el.find(s).first().text().trim();
        if (t) { address = t; break; }
      }
      let phone: string | null = null;
      for (const s of [".phone", ".tel", "[itemprop='telephone']"]) {
        const t = $el.find(s).first().text().trim();
        if (t) { phone = normaliseScraperPhone(t); break; }
      }
      results.push({ name, address, phone, website: null, description: null, source: "yellowpages.co.za" });
    });
  }
  return results;
}

async function scrapeBusinessListForCity(city: string, citySlug: string): Promise<ScrapedWorkshop[]> {
  const results: ScrapedWorkshop[] = [];
  const { load } = await import("cheerio");
  const url = `https://www.businesslist.co.za/category/automotive/mechanics/${citySlug}`;
  const html = await fetchScraperPage(url);
  if (!html) return results;
  const $ = load(html);
  const containers = [".listing", ".company", ".result", "article", ".card"];
  let $items = $() as ReturnType<typeof $>;
  for (const sel of containers) {
    $items = $(sel);
    if ($items.length > 0) break;
  }
  $items.each((_, el) => {
    const $el = $(el);
    let name = "";
    for (const s of [".company-name a", ".company-name", "h2 a", "h3 a", "h2", "h3"]) {
      const t = $el.find(s).first().text().trim();
      if (t) { name = normaliseName(t); break; }
    }
    if (!name) return;
    let address: string | null = null;
    for (const s of [".address", ".location", "[itemprop='address']"]) {
      const t = $el.find(s).first().text().trim();
      if (t) { address = t; break; }
    }
    let phone: string | null = null;
    for (const s of [".phone", ".tel", "[itemprop='telephone']"]) {
      const t = $el.find(s).first().text().trim();
      if (t) { phone = normaliseScraperPhone(t); break; }
    }
    results.push({ name, address, phone, website: null, description: null, source: "businesslist.co.za" });
  });
  return results;
}

const CITY_SLUG_MAP: Record<string, string> = {
  "Cape Town": "cape-town",
  "Johannesburg": "johannesburg",
  "Pretoria": "pretoria",
  "Durban": "durban",
  "Port Elizabeth": "port-elizabeth",
  "Bloemfontein": "bloemfontein",
  "Nelspruit": "nelspruit",
  "Polokwane": "polokwane",
  "East London": "east-london",
  "Sandton": "sandton",
};

async function handleScraperImport(
  prisma: ReturnType<typeof getPrisma>,
  ownerId: string,
  city: string
): Promise<NextResponse> {
  if (!prisma) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const province = CITY_TO_PROVINCE[city] ?? "";
  const citySlug = CITY_SLUG_MAP[city] ?? city.toLowerCase().replace(/\s+/g, "-");

  const allResults: ScrapedWorkshop[] = [];
  try {
    const yp = await scrapeYellowPagesForCity(city);
    allResults.push(...yp);
  } catch { /* ignore individual scraper failures */ }
  try {
    const bl = await scrapeBusinessListForCity(city, citySlug);
    allResults.push(...bl);
  } catch { /* ignore individual scraper failures */ }

  // Deduplicate by normalised name
  const seen = new Set<string>();
  const unique = allResults.filter((r) => {
    const key = r.name.toLowerCase().replace(/\s+/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  let imported = 0;
  let skipped = 0;
  for (const w of unique) {
    if (!w.name || w.name.length < 2) { skipped++; continue; }
    try {
      const slug = scraperSlugify(w.name, city);
      await prisma.workshop.upsert({
        where: { slug },
        create: {
          ownerId,
          name: w.name,
          slug,
          description: w.description ?? `${w.name} is a vehicle service and repair workshop in ${city}, South Africa.`,
          city,
          province,
          addressLine1: w.address ?? null,
          phone: w.phone ?? null,
          website: w.website ?? null,
          sourceName: w.source,
          listingTypes: ["Car Repair", "General Service"],
          status: "PENDING",
        },
        update: {
          phone: w.phone ?? undefined,
          website: w.website ?? undefined,
          addressLine1: w.address ?? undefined,
        },
      });
      imported++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ imported, skipped, source: "scraper" });
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

  let body: { city?: string; source?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const source = body.source ?? "places";
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

  // If source is 'scraper', run the web scraper logic instead of Places API
  if (source === "scraper") {
    return handleScraperImport(prisma, systemProfile.id, city);
  }

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
