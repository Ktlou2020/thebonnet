import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourcePath = path.join(__dirname, "..", "data", "workshops-curated-source.jsonl");
const outputPath = path.join(__dirname, "..", "data", "real-workshops.json");

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function inferMobile({ name, hours, types }) {
  const haystack = `${name} ${hours} ${types.join(" ")}`.toLowerCase();
  return haystack.includes("mobile") || haystack.includes("open 24 hours");
}

function inferServices({ name, types, mobile }) {
  const haystack = `${name} ${types.join(" ")}`.toLowerCase();
  const services = new Set(["General Service"]);

  if (mobile) services.add("Mobile Mechanic");
  if (haystack.includes("brake")) services.add("Brakes");
  if (haystack.includes("diagnostic") || haystack.includes("electrical") || haystack.includes("tune up")) services.add("Diagnostics");
  if (haystack.includes("air conditioning") || haystack.includes("aircon")) services.add("Aircon");
  if (haystack.includes("transmission")) services.add("Transmission");
  if (haystack.includes("body") || haystack.includes("dent") || haystack.includes("panel") || haystack.includes("paint")) services.add("Panel & Paint");
  if (haystack.includes("spring") || haystack.includes("suspension")) services.add("Suspension");
  if (haystack.includes("ev") || haystack.includes("hybrid")) services.add("EV & Hybrid");

  return [...services];
}

function inferFeatured({ rating, website, cityRank }) {
  if (cityRank <= 2) return true;
  if (rating >= 4.8 && website) return true;
  return false;
}

function parseInput(raw) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function dedupeListings(items) {
  const seen = new Set();
  const deduped = [];

  for (const item of items) {
    const key = item.placeId || item.slug;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  return deduped;
}

async function main() {
  const raw = await fs.readFile(sourcePath, "utf8");
  const sourceItems = parseInput(raw);
  const cityCounters = new Map();

  const normalized = sourceItems.map((item) => {
    const cityRank = (cityCounters.get(item.city) || 0) + 1;
    cityCounters.set(item.city, cityRank);

    const mobile = inferMobile(item);
    const types = Array.isArray(item.types) ? item.types : [];
    const services = inferServices({ name: item.name, types, mobile });
    const slug = slugify(`${item.name} ${item.city}`);

    return {
      slug,
      name: item.name,
      city: item.city,
      province: item.province,
      address: item.address,
      phone: item.phone || "",
      website: item.website || "",
      rating: Number(item.rating || 0),
      hours: item.hours || "Call or visit the workshop website for hours",
      types,
      services,
      mobile,
      featured: inferFeatured({ rating: Number(item.rating || 0), website: item.website || "", cityRank }),
      source: item.source || "Google Maps",
      placeId: item.placeId || slug
    };
  });

  const deduped = dedupeListings(normalized).sort((a, b) => {
    return a.city.localeCompare(b.city) || Number(b.featured) - Number(a.featured) || b.rating - a.rating || a.name.localeCompare(b.name);
  });

  await fs.writeFile(outputPath, `${JSON.stringify(deduped, null, 2)}\n`);
  console.log(`[build-workshops] Wrote ${deduped.length} workshop listings to ${path.relative(process.cwd(), outputPath)}.`);
}

main().catch((error) => {
  console.error("[build-workshops] Failed to build workshop seed.");
  console.error(error);
  process.exit(1);
});
