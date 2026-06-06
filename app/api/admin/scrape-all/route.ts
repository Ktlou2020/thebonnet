import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/db";

const SA_CITIES = [
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

// Bounding boxes for each city (south, west, north, east)
const CITY_BBOX: Record<string, [number, number, number, number]> = {
  "Cape Town":      [-34.12, 18.30, -33.73, 18.90],
  "Johannesburg":   [-26.40, 27.80, -25.90, 28.30],
  "Pretoria":       [-25.85, 28.00, -25.50, 28.50],
  "Durban":         [-30.05, 30.80, -29.70, 31.10],
  "Port Elizabeth": [-34.05, 25.40, -33.75, 26.00],
  "Bloemfontein":   [-29.25, 26.10, -28.95, 26.45],
  "Nelspruit":      [-25.60, 30.90, -25.35, 31.05],
  "Polokwane":      [-24.00, 29.35, -23.75, 29.60],
  "East London":    [-33.10, 27.75, -32.90, 28.10],
  "Sandton":        [-26.15, 28.00, -26.05, 28.15],
};

interface OsmElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function slugify(name: string, city: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${base}-${citySlug}`;
}

function normalisePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (digits.startsWith("27") && digits.length >= 11) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 10) digits = digits.slice(1);
  if (digits.length !== 9) return raw.trim();
  return `+27 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

async function fetchOverpassForCity(city: string): Promise<OsmElement[]> {
  const bbox = CITY_BBOX[city];
  if (!bbox) return [];
  const [s, w, n, e] = bbox;
  const query = `
[out:json][timeout:60];
(
  node["shop"="car_repair"](${s},${w},${n},${e});
  way["shop"="car_repair"](${s},${w},${n},${e});
  node["amenity"="car_repair"](${s},${w},${n},${e});
  way["amenity"="car_repair"](${s},${w},${n},${e});
  node["shop"="tyres"](${s},${w},${n},${e});
  node["craft"="car_repair"](${s},${w},${n},${e});
);
out center;
`.trim();

  const attempt = async (): Promise<OsmElement[]> => {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(90000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "(no body)");
      throw new Error(`Overpass HTTP ${res.status} for ${city}: ${text.slice(0, 200)}`);
    }
    const data = await res.json() as { elements?: OsmElement[] };
    return data.elements ?? [];
  };

  try {
    return await attempt();
  } catch (err) {
    console.error(`[scrape-all] fetchOverpassForCity(${city}) attempt 1 failed:`, err);
    // Retry once after a brief pause
    await new Promise((r) => setTimeout(r, 3000));
    try {
      return await attempt();
    } catch (retryErr) {
      console.error(`[scrape-all] fetchOverpassForCity(${city}) attempt 2 failed:`, retryErr);
      return [];
    }
  }
}

export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const systemProfile = await prisma.profile.upsert({
    where: { email: "system@thebonnet.co.za" },
    update: {},
    create: { email: "system@thebonnet.co.za", fullName: "My Bonnet System", role: "ADMIN" },
  });

  let totalImported = 0;
  let totalSkipped = 0;
  const byCity: { city: string; imported: number; skipped: number }[] = [];

  for (const city of SA_CITIES) {
    const province = CITY_TO_PROVINCE[city] ?? "";
    let cityImported = 0;
    let citySkipped = 0;

    try {
      const elements = await fetchOverpassForCity(city);

      // Deduplicate by OSM id and name
      const seen = new Set<string>();
      const unique = elements.filter((el) => {
        const name = el.tags?.name;
        if (!name || name.length < 2) return false;
        const key = name.toLowerCase().replace(/\s+/g, "");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      for (const el of unique) {
        const name = el.tags?.name ?? "";
        if (!name) { citySkipped++; continue; }

        const phone = normalisePhone(el.tags?.phone ?? el.tags?.["contact:phone"] ?? null);
        const website = el.tags?.website ?? el.tags?.["contact:website"] ?? null;
        const addr = [
          el.tags?.["addr:housenumber"],
          el.tags?.["addr:street"],
          el.tags?.["addr:suburb"],
        ].filter(Boolean).join(", ") || null;

        const lat = el.lat ?? el.center?.lat ?? null;
        const lng = el.lon ?? el.center?.lon ?? null;

        const shopType = el.tags?.shop ?? el.tags?.amenity ?? "";
        const listingTypes = shopType === "tyres" ? ["Tyres"] : ["Car Repair", "General Service"];

        try {
          const slug = slugify(name, city);
          await prisma.workshop.upsert({
            where: { slug },
            create: {
              ownerId: systemProfile.id,
              name,
              slug,
              description: `${name} is a vehicle service and repair workshop in ${city}, South Africa.`,
              city,
              province,
              addressLine1: addr,
              phone,
              website,
              latitude: lat,
              longitude: lng,
              sourceName: "OpenStreetMap",
              listingTypes,
              status: "PENDING",
            },
            update: {
              phone: phone ?? undefined,
              website: website ?? undefined,
              addressLine1: addr ?? undefined,
              latitude: lat ?? undefined,
              longitude: lng ?? undefined,
            },
          });
          cityImported++;
        } catch (upsertErr) {
          console.error(`[scrape-all] upsert failed for "${name}" in ${city}:`, upsertErr);
          citySkipped++;
        }
      }
    } catch (cityErr) {
      console.error(`[scrape-all] processing failed for city ${city}:`, cityErr);
    }

    byCity.push({ city, imported: cityImported, skipped: citySkipped });
    totalImported += cityImported;
    totalSkipped += citySkipped;
  }

  return NextResponse.json({ totalImported, totalSkipped, byCity });
}
