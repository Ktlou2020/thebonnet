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

interface ScrapedWorkshop {
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  source: string;
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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

function normalisePhone(raw: string | null): string | null {
  if (!raw) return null;
  let digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (digits.startsWith("27") && digits.length >= 11) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 10) digits = digits.slice(1);
  if (digits.length !== 9) return raw.trim();
  return `+27 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

function normaliseName(name: string): string {
  const trimmed = name.trim();
  if (trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
    return trimmed.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }
  return trimmed;
}

function slugify(name: string, city: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${base}-${citySlug}`;
}

async function scrapeCity(city: string): Promise<ScrapedWorkshop[]> {
  const { load } = await import("cheerio");
  const results: ScrapedWorkshop[] = [];
  const citySlug = CITY_SLUG_MAP[city] ?? city.toLowerCase().replace(/\s+/g, "-");

  // YellowPages
  for (const q of ["mechanic+workshop", "auto+repair"]) {
    const url = `https://www.yellowpages.co.za/search?q=${q}&l=${encodeURIComponent(city)}`;
    const html = await fetchPage(url);
    if (!html) continue;
    const $ = load(html);
    let $items = $() as ReturnType<typeof $>;
    for (const sel of [".listing", ".result", "[data-listing]", ".business-listing", "article"]) {
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
        if (t) { phone = normalisePhone(t); break; }
      }
      results.push({ name, address, phone, website: null, description: null, source: "yellowpages.co.za" });
    });
  }

  // BusinessList
  const blUrl = `https://www.businesslist.co.za/category/automotive/mechanics/${citySlug}`;
  const blHtml = await fetchPage(blUrl);
  if (blHtml) {
    const $ = load(blHtml);
    let $items = $() as ReturnType<typeof $>;
    for (const sel of [".listing", ".company", ".result", "article", ".card"]) {
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
        if (t) { phone = normalisePhone(t); break; }
      }
      results.push({ name, address, phone, website: null, description: null, source: "businesslist.co.za" });
    });
  }

  return results;
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

  let totalImported = 0;
  let totalSkipped = 0;
  const byCity: { city: string; imported: number; skipped: number }[] = [];

  for (const city of SA_CITIES) {
    const province = CITY_TO_PROVINCE[city] ?? "";
    let cityImported = 0;
    let citySkipped = 0;

    try {
      const raw = await scrapeCity(city);

      // Deduplicate
      const seen = new Set<string>();
      const unique = raw.filter((r) => {
        const key = r.name.toLowerCase().replace(/\s+/g, "");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      for (const w of unique) {
        if (!w.name || w.name.length < 2) { citySkipped++; continue; }
        try {
          const slug = slugify(w.name, city);
          await prisma.workshop.upsert({
            where: { slug },
            create: {
              ownerId: systemProfile.id,
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
          cityImported++;
        } catch {
          citySkipped++;
        }
      }
    } catch {
      // continue to next city
    }

    byCity.push({ city, imported: cityImported, skipped: citySkipped });
    totalImported += cityImported;
    totalSkipped += citySkipped;
  }

  return NextResponse.json({ totalImported, totalSkipped, byCity });
}
