import fs from "node:fs/promises";
import path from "node:path";

export const SOUTH_AFRICA_COUNTRY_CODE = "+27";
export const DEFAULT_WORKSHOP_SOURCE = "Google Maps";
export const DEFAULT_HOURS_TEXT = "Call or visit the workshop website for hours";
export const SUPPORTED_SERVICE_CATEGORIES = [
  "General Service",
  "Brakes",
  "Diagnostics",
  "Suspension",
  "Transmission",
  "Panel & Paint",
  "Aircon",
  "EV & Hybrid",
  "Mobile Mechanic"
];

const defaultProvinceByCity = new Map([
  ["bloemfontein", "Free State"],
  ["cape town", "Western Cape"],
  ["durban", "KwaZulu-Natal"],
  ["east london", "Eastern Cape"],
  ["gqeberha", "Eastern Cape"],
  ["johannesburg", "Gauteng"],
  ["kimberley", "Northern Cape"],
  ["nelspruit", "Mpumalanga"],
  ["mbombela", "Mpumalanga"],
  ["polokwane", "Limpopo"],
  ["port elizabeth", "Eastern Cape"],
  ["pretoria", "Gauteng"]
]);

const cityAliasMap = new Map([
  ["joburg", "Johannesburg"],
  ["jozi", "Johannesburg"],
  ["cape town cbd", "Cape Town"],
  ["gqebs", "Gqeberha"],
  ["mbombela", "Nelspruit"],
  ["nelspruit", "Nelspruit"],
  ["pe", "Gqeberha"],
  ["port elizabeth", "Gqeberha"],
  ["pta", "Pretoria"]
]);

const scrapeCities = [
  { city: "Johannesburg", province: "Gauteng" },
  { city: "Cape Town", province: "Western Cape" },
  { city: "Durban", province: "KwaZulu-Natal" },
  { city: "Pretoria", province: "Gauteng" },
  { city: "Gqeberha", province: "Eastern Cape" },
  { city: "Bloemfontein", province: "Free State" },
  { city: "East London", province: "Eastern Cape" },
  { city: "Polokwane", province: "Limpopo" },
  { city: "Nelspruit", province: "Mpumalanga" },
  { city: "Kimberley", province: "Northern Cape" }
];

const scrapeQueryTemplates = [
  "car mechanic {city} South Africa",
  "auto repair shop {city} South Africa",
  "mobile mechanic {city} South Africa"
];

const serviceKeywordRules = [
  { pattern: /(service|repair|maintenance|mechanic|workshop|garage|clutch|engine|motor)/i, service: "General Service" },
  { pattern: /(brake|abs)/i, service: "Brakes" },
  { pattern: /(diagnostic|diagnostics|electrical|tune up|tune-up|scanner|ecu)/i, service: "Diagnostics" },
  { pattern: /(aircon|air conditioning|ac service|a\/c)/i, service: "Aircon" },
  { pattern: /(transmission|gearbox|cvt)/i, service: "Transmission" },
  { pattern: /(body|paint|panel|dent|spray)/i, service: "Panel & Paint" },
  { pattern: /(suspension|shock|shocks|spring|alignment)/i, service: "Suspension" },
  { pattern: /(ev|electric vehicle|hybrid)/i, service: "EV & Hybrid" },
  { pattern: /(mobile|roadside|callout|on-site|onsite)/i, service: "Mobile Mechanic" }
];

const directoryIgnoreNames = new Set([".gitkeep", ".ds_store"]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toDisplayCase(value) {
  const cleaned = normalizeWhitespace(value).toLowerCase();
  if (!cleaned) return "";
  return cleaned.replace(/\b([a-z])/g, (match) => match.toUpperCase());
}

function uniqueStrings(values) {
  const seen = new Set();
  const results = [];

  for (const value of values) {
    const cleaned = normalizeWhitespace(value);
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(cleaned);
  }

  return results;
}

export function normalizeBoolean(value) {
  if (typeof value === "boolean") return value;
  const normalized = normalizeWhitespace(value).toLowerCase();
  return ["1", "true", "yes", "y", "featured"].includes(normalized);
}

function normalizeNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const normalized = normalizeWhitespace(value).replace(/[^0-9.\-]/g, "");
  if (!normalized) return 0;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function splitMultiValueString(value) {
  return normalizeWhitespace(value)
    .split(/\s*\|\s*|\s*;\s*|\s*\/\s*|\s*,\s*/)
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean);
}

export function ensureArray(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => (typeof item === "string" ? splitMultiValueString(item) : item != null ? [String(item)] : [])).filter(Boolean);
  }

  if (typeof value === "string") {
    return splitMultiValueString(value);
  }

  if (value == null) return [];
  return [normalizeWhitespace(value)].filter(Boolean);
}

export function normalizeCity(value) {
  const raw = normalizeWhitespace(value);
  if (!raw) return "";
  const key = raw.toLowerCase();
  return cityAliasMap.get(key) || toDisplayCase(raw);
}

export function normalizeProvince(value, city) {
  const raw = normalizeWhitespace(value);
  if (raw) return toDisplayCase(raw);
  const cityKey = normalizeCity(city).toLowerCase();
  return defaultProvinceByCity.get(cityKey) || "";
}

export function normalizePhone(value) {
  const raw = normalizeWhitespace(value);
  if (!raw) return "";

  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";

  if (hasPlus) {
    return `+${digits}`;
  }

  if (digits.startsWith("27")) {
    return `+${digits}`;
  }

  if (digits.startsWith("0") && digits.length >= 9) {
    return `${SOUTH_AFRICA_COUNTRY_CODE}${digits.slice(1)}`;
  }

  if (digits.length >= 9) {
    return `${SOUTH_AFRICA_COUNTRY_CODE}${digits}`;
  }

  return raw;
}

export function normalizeWebsite(value) {
  const raw = normalizeWhitespace(value);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^www\./i.test(raw)) return `https://${raw}`;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw)) return `https://${raw}`;
  return raw;
}

function normalizeTypes(value) {
  return uniqueStrings(ensureArray(value));
}

function normalizeServices(value) {
  const services = ensureArray(value).map((item) => normalizeWhitespace(item).toLowerCase());
  const mapped = services.flatMap((service) => {
    const found = serviceKeywordRules.find((rule) => rule.pattern.test(service));
    return found ? [found.service] : [];
  });

  if (services.some((service) => service === "mobile mechanic")) {
    mapped.push("Mobile Mechanic");
  }

  return uniqueStrings(mapped.filter((item) => SUPPORTED_SERVICE_CATEGORIES.includes(item)));
}

function inferMobile({ name, hours, types, services, address }) {
  const haystack = [name, hours, address, ...types, ...services].join(" ").toLowerCase();
  return /(mobile|roadside|callout|on-site|onsite|open 24 hours|24\/7)/i.test(haystack);
}

function inferServices({ name, hours, types, services, mobile }) {
  const haystackValues = [name, hours, ...types, ...services];
  const inferred = new Set(normalizeServices(services));

  for (const value of haystackValues) {
    for (const rule of serviceKeywordRules) {
      if (rule.pattern.test(String(value || ""))) {
        inferred.add(rule.service);
      }
    }
  }

  inferred.add("General Service");
  if (mobile) inferred.add("Mobile Mechanic");

  return SUPPORTED_SERVICE_CATEGORIES.filter((item) => inferred.has(item));
}

function normalizeSource(value) {
  return normalizeWhitespace(value) || DEFAULT_WORKSHOP_SOURCE;
}

function normalizeHours(value) {
  return normalizeWhitespace(value) || DEFAULT_HOURS_TEXT;
}

function normalizeAddress(value, city, province) {
  const address = normalizeWhitespace(value);
  if (address) return address;
  return [city, province, "South Africa"].filter(Boolean).join(", ");
}

function bestString(current, incoming, { preferLonger = true, defaultValue = "" } = {}) {
  const currentClean = normalizeWhitespace(current);
  const incomingClean = normalizeWhitespace(incoming);
  if (!incomingClean) return currentClean || defaultValue;
  if (!currentClean) return incomingClean;
  if (currentClean === incomingClean) return currentClean;
  if (!preferLonger) return incomingClean;
  return incomingClean.length > currentClean.length ? incomingClean : currentClean;
}

function mergeSource(current, incoming) {
  const merged = uniqueStrings([current, incoming]);
  return merged[0] || DEFAULT_WORKSHOP_SOURCE;
}

function buildDedupeKeys(listing) {
  const keys = [];
  const slug = slugify(`${listing.name} ${listing.city}`);
  const addressSlug = slugify(listing.address);
  const normalizedPhone = normalizePhone(listing.phone);
  const normalizedWebsite = normalizeWebsite(listing.website).toLowerCase();
  const normalizedPlaceId = normalizeWhitespace(listing.placeId).toLowerCase();

  if (normalizedPlaceId) keys.push(`place:${normalizedPlaceId}`);
  if (normalizedPhone) keys.push(`phone:${normalizedPhone}`);
  if (slug && addressSlug) keys.push(`name-address:${slug}:${addressSlug}`);

  return uniqueStrings(keys);
}

export function normalizeListing(raw) {
  if (!isPlainObject(raw)) return null;

  const name = normalizeWhitespace(raw.name || raw.title || raw.businessName || raw.workshopName || raw.shopName);
  const city = normalizeCity(raw.city || raw.locality || raw.town || raw.metro || raw.region);
  const province = normalizeProvince(raw.province || raw.state || raw.regionName, city);
  if (!name || !city || !province) return null;

  const types = normalizeTypes(raw.types || raw.type || raw.categories || raw.businessTypes || raw.listingTypes);
  const services = normalizeServices(raw.services || raw.serviceTags || raw.specialities || raw.specialties || raw.tags);
  const hours = normalizeHours(raw.hours || raw.openingHours || raw.opening_hours || raw.businessHours);
  const address = normalizeAddress(raw.address || raw.streetAddress || raw.addressLine1 || raw.formattedAddress, city, province);
  const phone = normalizePhone(raw.phone || raw.phoneNumber || raw.telephone || raw.whatsapp);
  const website = normalizeWebsite(raw.website || raw.url || raw.domain || raw.businessUrl);
  const rating = Math.min(5, Math.max(0, normalizeNumber(raw.rating || raw.stars || raw.score)));
  const source = normalizeSource(raw.source || raw.sourceName || raw.platform || raw.provider);
  const placeId = normalizeWhitespace(raw.placeId || raw.place_id || raw.externalPlaceId || raw.googlePlaceId);
  const featured = normalizeBoolean(raw.featured);
  const mobile = inferMobile({ name, hours, types, services, address }) || normalizeBoolean(raw.mobile || raw.mobileService || raw.isMobile);
  const normalizedServices = inferServices({ name, hours, types, services, mobile });
  const slug = slugify(`${name} ${city}`);

  return {
    slug,
    name,
    city,
    province,
    address,
    phone,
    website,
    rating,
    hours,
    types,
    services: normalizedServices,
    mobile,
    featured,
    source,
    placeId
  };
}

function mergeListings(current, incoming) {
  const mergedMobile = Boolean(current.mobile || incoming.mobile);
  const mergedServices = inferServices({
    name: bestString(current.name, incoming.name),
    hours: bestString(current.hours, incoming.hours, { defaultValue: DEFAULT_HOURS_TEXT }),
    types: uniqueStrings([...(current.types || []), ...(incoming.types || [])]),
    services: uniqueStrings([...(current.services || []), ...(incoming.services || [])]),
    mobile: mergedMobile
  });

  return {
    slug: bestString(current.slug, incoming.slug, { preferLonger: false }),
    name: bestString(current.name, incoming.name),
    city: bestString(current.city, incoming.city, { preferLonger: false }),
    province: bestString(current.province, incoming.province, { preferLonger: false }),
    address: bestString(current.address, incoming.address),
    phone: bestString(current.phone, incoming.phone, { preferLonger: false }),
    website: bestString(current.website, incoming.website, { preferLonger: false }),
    rating: Math.max(normalizeNumber(current.rating), normalizeNumber(incoming.rating)),
    hours: bestString(current.hours, incoming.hours, { defaultValue: DEFAULT_HOURS_TEXT }),
    types: uniqueStrings([...(current.types || []), ...(incoming.types || [])]),
    services: mergedServices,
    mobile: mergedMobile,
    featured: Boolean(current.featured || incoming.featured),
    source: mergeSource(current.source, incoming.source),
    placeId: bestString(current.placeId, incoming.placeId, { preferLonger: false })
  };
}

export function dedupeAndMergeListings(listings) {
  const deduped = [];
  const indexByKey = new Map();

  for (const rawListing of listings) {
    const listing = normalizeListing(rawListing);
    if (!listing) continue;

    const existingIndex = buildDedupeKeys(listing)
      .map((key) => indexByKey.get(key))
      .find((value) => value !== undefined);

    if (existingIndex === undefined) {
      const nextIndex = deduped.push(listing) - 1;
      for (const key of buildDedupeKeys(listing)) {
        indexByKey.set(key, nextIndex);
      }
      continue;
    }

    deduped[existingIndex] = mergeListings(deduped[existingIndex], listing);
    for (const key of buildDedupeKeys(deduped[existingIndex])) {
      indexByKey.set(key, existingIndex);
    }
  }

  return deduped;
}

export function sortListings(listings) {
  return [...listings].sort((a, b) => {
    return a.city.localeCompare(b.city) || Number(b.featured) - Number(a.featured) || b.rating - a.rating || a.name.localeCompare(b.name);
  });
}

export function inferFeatured({ rating, website, cityRank }) {
  if (cityRank <= 2) return true;
  if (rating >= 4.8 && website) return true;
  return false;
}

export function buildSeedListings(sourceItems) {
  const deduped = sortListings(dedupeAndMergeListings(sourceItems));
  const cityCounters = new Map();

  return deduped.map((item) => {
    const cityRank = (cityCounters.get(item.city) || 0) + 1;
    cityCounters.set(item.city, cityRank);

    return {
      ...item,
      placeId: item.placeId || item.slug,
      featured: Boolean(item.featured || inferFeatured({ rating: item.rating, website: item.website, cityRank }))
    };
  });
}

export function formatJsonl(listings) {
  return `${sortListings(dedupeAndMergeListings(listings)).map((item) => JSON.stringify(item)).join("\n")}\n`;
}

export async function readJsonlFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells.map((cell) => normalizeWhitespace(cell));
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length <= 1) return [];
  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((record, header, index) => {
      record[header] = values[index] ?? "";
      return record;
    }, {});
  });
}

function extractArrayFromObject(value) {
  if (Array.isArray(value)) return value;
  if (!isPlainObject(value)) return [];

  for (const key of ["results", "items", "listings", "workshops", "data"]) {
    if (Array.isArray(value[key])) return value[key];
  }

  return [];
}

export async function readStructuredFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const raw = await fs.readFile(filePath, "utf8");

  if (extension === ".jsonl") {
    return readJsonlFile(filePath);
  }

  if (extension === ".csv") {
    return parseCsv(raw);
  }

  if (extension === ".json") {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return extractArrayFromObject(parsed);
  }

  return [];
}

export async function listFilesRecursive(directoryPath) {
  try {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((entry) => !entry.name.startsWith(".") && !directoryIgnoreNames.has(entry.name.toLowerCase()))
        .map(async (entry) => {
          const resolvedPath = path.join(directoryPath, entry.name);
          if (entry.isDirectory()) return listFilesRecursive(resolvedPath);
          return [resolvedPath];
        })
    );

    return files.flat().sort((a, b) => a.localeCompare(b));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function loadListingsFromDirectory(directoryPath) {
  const files = await listFilesRecursive(directoryPath);
  const structuredFiles = files.filter((filePath) => /\.(json|jsonl|csv)$/i.test(filePath));
  const records = [];

  for (const filePath of structuredFiles) {
    const items = await readStructuredFile(filePath);
    records.push(...items);
  }

  return { files: structuredFiles, records };
}

export async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

export async function writeJsonFile(filePath, data) {
  await ensureDirectory(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

export async function writeJsonlFile(filePath, listings) {
  await ensureDirectory(path.dirname(filePath));
  await fs.writeFile(filePath, formatJsonl(listings));
}

export function getDefaultScrapeManifest() {
  return scrapeCities.flatMap(({ city, province }) => {
    return scrapeQueryTemplates.map((query, index) => ({
      id: `${slugify(city)}-${index + 1}`,
      city,
      province,
      source: DEFAULT_WORKSHOP_SOURCE,
      query: query.replaceAll("{city}", city),
      outputHint: `data/imports/workshops/${slugify(city)}-${index + 1}.json`
    }));
  });
}
