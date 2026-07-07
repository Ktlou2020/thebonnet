import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/db";
import { SERVICE_AREAS, AREA_TO_REGION } from "@/lib/areas";

const SA_CITIES = [...SERVICE_AREAS];

const CITY_TO_PROVINCE: Record<string, string> = Object.fromEntries(
  SERVICE_AREAS.map((area) => [area, "Gauteng"])
);

// Bounding boxes per Joburg suburb (south, west, north, east)
const CITY_BBOX: Record<string, [number, number, number, number]> = {
  "Sandton":          [-26.12, 28.02, -26.06, 28.10],
  "Randburg":         [-26.12, 27.96, -26.04, 28.05],
  "Fourways":         [-26.03, 28.00, -25.96, 28.08],
  "Midrand":          [-25.99, 28.10, -25.92, 28.18],
  "Bryanston":        [-26.09, 28.00, -26.05, 28.06],
  "Sunninghill":      [-26.05, 28.08, -26.01, 28.13],
  "Rivonia":          [-26.06, 28.05, -26.03, 28.09],
  "Morningside":      [-26.08, 28.07, -26.05, 28.11],
  "Roodepoort":       [-26.18, 27.83, -26.11, 27.93],
  "Florida":          [-26.18, 27.89, -26.14, 27.94],
  "Weltevreden Park": [-26.15, 27.86, -26.10, 27.92],
  "Northcliff":       [-26.13, 27.96, -26.09, 28.00],
  "Cresta":           [-26.14, 27.97, -26.11, 28.01],
  "Honeydew":         [-26.08, 27.93, -26.03, 27.99],
  "Northgate":        [-26.12, 27.97, -26.09, 28.01],
  "Krugersdorp":      [-26.12, 27.74, -26.05, 27.83],
};

// Keep reference to AREA_TO_REGION for province lookup (all Gauteng)
void AREA_TO_REGION;

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
