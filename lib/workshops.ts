import listings from "@/data/real-workshops.json";
import { getPrisma } from "@/lib/db";
import { CityHighlight, ConsumerPlan, Mechanic, Metric, PriceBenchmark, ServiceCategory, SubscriptionPlan } from "@/lib/types";

const serviceCategoryOrder: ServiceCategory[] = [
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

const staticMechanics: Mechanic[] = (listings as Array<Omit<Mechanic, "id">>)
  .filter((item) => item.city === "Johannesburg")
  .map((item, index) => ({
    id: String(index + 1),
    ...item,
    services: normalizeServices(item.services),
  }));

export const priceBenchmarks: PriceBenchmark[] = [
  {
    id: "1",
    job: "Brake pad replacement (front)",
    vehicle: "VW Polo 1.4",
    independentAverage: 2200,
    low: 1600,
    high: 2800,
    dealershipAverage: 4800,
    confidence: "High",
    note: "Front brake pads only, labour included. Budget aftermarket pads skew toward the lower end; OEM replacements toward the upper end.",
    source: "My Bonnet pricing beta",
    sourceUrl: "https://thebonnet.co.za"
  },
  {
    id: "2",
    job: "Oil & filter service",
    vehicle: "Toyota Corolla 1.8",
    independentAverage: 850,
    low: 650,
    high: 1100,
    dealershipAverage: 1600,
    confidence: "High",
    note: "5W-30 synthetic oil, OEM-grade filter. Price includes up to 5L oil and labour.",
    source: "My Bonnet pricing beta",
    sourceUrl: "https://thebonnet.co.za"
  },
  {
    id: "3",
    job: "Full major service (90,000 km)",
    vehicle: "Ford Ranger 2.2",
    independentAverage: 5800,
    low: 4500,
    high: 7200,
    dealershipAverage: 11000,
    confidence: "Medium",
    note: "Includes spark plugs, air filter, oil, brake fluid, coolant check, and full inspection.",
    source: "My Bonnet pricing beta",
    sourceUrl: "https://thebonnet.co.za"
  },
  {
    id: "4",
    job: "Clutch replacement",
    vehicle: "VW Golf 7 1.4 TSI",
    independentAverage: 8500,
    low: 6800,
    high: 11000,
    dealershipAverage: 18000,
    confidence: "Medium",
    note: "Complete clutch kit (disc, pressure plate, release bearing) plus gearbox removal labour.",
    source: "My Bonnet pricing beta",
    sourceUrl: "https://thebonnet.co.za"
  },
  {
    id: "5",
    job: "Wheel alignment (4-wheel)",
    vehicle: "All vehicles",
    independentAverage: 650,
    low: 450,
    high: 900,
    dealershipAverage: 1200,
    confidence: "High",
    note: "Laser or computerised 4-wheel alignment. Tyre rotation not included.",
    source: "My Bonnet pricing beta",
    sourceUrl: "https://thebonnet.co.za"
  },
  {
    id: "6",
    job: "Aircon regas & service",
    vehicle: "All vehicles",
    independentAverage: 950,
    low: 700,
    high: 1300,
    dealershipAverage: 1800,
    confidence: "High",
    note: "Includes vacuum test, R134a refrigerant recharge, and UV dye leak check.",
    source: "My Bonnet pricing beta",
    sourceUrl: "https://thebonnet.co.za"
  },
  {
    id: "7",
    job: "Battery replacement",
    vehicle: "Hyundai Tucson 2.0",
    independentAverage: 1400,
    low: 950,
    high: 1900,
    dealershipAverage: 2600,
    confidence: "High",
    note: "Includes battery, terminal grease, and coding on vehicles with battery management systems.",
    source: "My Bonnet pricing beta",
    sourceUrl: "https://thebonnet.co.za"
  },
  {
    id: "8",
    job: "Shock absorber replacement (pair, front)",
    vehicle: "Toyota Hilux 2.4",
    independentAverage: 4200,
    low: 3200,
    high: 5500,
    dealershipAverage: 8500,
    confidence: "Medium",
    note: "Bilstein or Monroe equivalent shocks. Wheel alignment afterwards is recommended.",
    source: "My Bonnet pricing beta",
    sourceUrl: "https://thebonnet.co.za"
  },
  {
    id: "9",
    job: "Timing belt & water pump kit",
    vehicle: "Honda Jazz 1.5",
    independentAverage: 5200,
    low: 4000,
    high: 6500,
    dealershipAverage: 9800,
    confidence: "Medium",
    note: "Timing belt, tensioner, idler pulley, and water pump. Coolant flush included.",
    source: "My Bonnet pricing beta",
    sourceUrl: "https://thebonnet.co.za"
  },
  {
    id: "10",
    job: "Wheel balancing (set of 4)",
    vehicle: "All vehicles",
    independentAverage: 380,
    low: 280,
    high: 500,
    dealershipAverage: 700,
    confidence: "High",
    note: "Dynamic balancing per wheel. Weights included.",
    source: "My Bonnet pricing beta",
    sourceUrl: "https://thebonnet.co.za"
  },
  {
    id: "11",
    job: "Spark plug replacement (set of 4)",
    vehicle: "BMW 3-Series 320i",
    independentAverage: 2800,
    low: 2200,
    high: 3600,
    dealershipAverage: 5500,
    confidence: "Medium",
    note: "NGK or Bosch iridium plugs. Labour for engine cover removal included.",
    source: "My Bonnet pricing beta",
    sourceUrl: "https://thebonnet.co.za"
  },
  {
    id: "12",
    job: "Radiator replacement",
    vehicle: "Nissan NP200 1.6",
    independentAverage: 3800,
    low: 2800,
    high: 5000,
    dealershipAverage: 7200,
    confidence: "Medium",
    note: "Aftermarket aluminium radiator. Coolant flush and re-fill included.",
    source: "My Bonnet pricing beta",
    sourceUrl: "https://thebonnet.co.za"
  },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    name: "Free",
    price: "R0",
    period: "forever",
    description: "Get discovered. No upfront cost.",
    features: [
      "Claim your listing",
      "Basic visibility in directory",
      "Up to 3 lead credits/month",
      "Customer reviews & ratings",
    ],
    cta: "Claim free listing",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "R799",
    period: "month",
    description: "For active workshops ready to grow.",
    features: [
      "50 lead credits included",
      "R25 per additional lead",
      "Priority ranking in search",
      "Performance dashboard",
      "WhatsApp lead notifications",
      "Response time badge",
    ],
    cta: "Start Growth plan",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "R1,499",
    period: "month",
    description: "For high-volume workshops and multi-branch operations.",
    features: [
      "Unlimited leads at R15 each",
      "Sponsored placement",
      "Fleet & emergency dispatch access",
      "Multi-branch management",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Go Pro",
    highlighted: false,
  },
];

export const consumerPlans: ConsumerPlan[] = [
  {
    name: "Free",
    price: "R0",
    description: "Find mechanics, get started.",
    features: [
      "Search the full directory",
      "3 AI diagnoses per month",
      "1 garage vehicle",
      "Request quotes",
    ],
    cta: "Get started free",
    highlighted: false,
  },
  {
    name: "Bonnet Plus",
    price: "R49",
    description: "Own your car's health.",
    features: [
      "Unlimited AI diagnoses",
      "Unlimited garage vehicles",
      "Full service history & cost tracker",
      "Priority quote routing",
      "Maintenance reminders",
      "Quote archive",
    ],
    cta: "Upgrade to Plus",
    highlighted: true,
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeServices(values: string[]): ServiceCategory[] {
  const deduped = Array.from(new Set(values));
  return deduped.filter((value): value is ServiceCategory => serviceCategoryOrder.includes(value as ServiceCategory));
}

function buildCityHighlights(items: Mechanic[]): CityHighlight[] {
  const grouped = new Map<string, CityHighlight>();

  for (const mechanic of items) {
    const existing = grouped.get(mechanic.city);
    if (existing) {
      existing.count += 1;
      continue;
    }

    grouped.set(mechanic.city, {
      city: mechanic.city,
      province: mechanic.province,
      count: 1,
      slug: slugify(mechanic.city)
    });
  }

  return [...grouped.values()].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}

function buildMetrics(items: Mechanic[]): Metric[] {
  const cityCount = new Set(items.map((item) => item.city)).size;
  const mobileCount = items.filter((item) => item.mobile).length;
  const averageRating = items.reduce((sum, item) => sum + item.rating, 0) / items.length;

  return [
    {
      label: "Public workshop listings",
      value: `${items.length}`,
      detail: "Curated inventory from public workshop listings, prepared for database seeding into Railway PostgreSQL."
    },
    {
      label: "Cities covered",
      value: `${cityCount}`,
      detail: "Coverage across key South African metros and regional centres where drivers actively search for mechanics."
    },
    {
      label: "Average public rating",
      value: averageRating.toFixed(1),
      detail: "Average of the public ratings shown on the source workshop listings used for directory curation."
    },
    {
      label: "Mobile or 24/7 options",
      value: `${mobileCount}`,
      detail: "Useful for urgent callouts, roadside issues, after-hours repairs, and customers who need a mechanic to come to them."
    }
  ];
}

function buildServiceCategories(items: Mechanic[]): ServiceCategory[] {
  const available = new Set(items.flatMap((item) => item.services));
  return serviceCategoryOrder.filter((item) => available.has(item));
}

async function loadDbMechanics(): Promise<Mechanic[] | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  try {
    const workshops = await prisma.workshop.findMany({
      where: { status: "VERIFIED" },
      include: { services: { include: { category: true } } },
      orderBy: [{ featured: "desc" }, { ratingAverage: "desc" }, { name: "asc" }]
    });

    if (!workshops.length) return null;

    return workshops.map((workshop, index) => {
      let responseTimeLabel: string | undefined;
      if (workshop.responseMinutes) {
        if (workshop.responseMinutes < 60) {
          responseTimeLabel = `Replies within ${workshop.responseMinutes}m`;
        } else {
          const h = Math.round(workshop.responseMinutes / 60);
          responseTimeLabel = `Replies within ${h}h`;
        }
      } else if (workshop.subscriptionTier === "GROWTH" || workshop.subscriptionTier === "PRO") {
        responseTimeLabel = "Replies within 24h";
      }

      return {
        id: workshop.id ?? `db-${index + 1}`,
        slug: workshop.slug,
        name: workshop.name,
        city: workshop.city,
        province: workshop.province,
        address: workshop.addressLine1 ?? [workshop.suburb, workshop.city, workshop.province].filter(Boolean).join(", "),
        phone: workshop.phone ?? workshop.whatsapp ?? undefined,
        website: workshop.website ?? undefined,
        rating: Number(workshop.ratingAverage) || 0,
        hours: workshop.hoursText ?? "Call or visit the workshop website for hours.",
        types: workshop.listingTypes.length ? workshop.listingTypes : [workshop.mobileService ? "Mobile mechanic" : "Auto repair shop"],
        services: normalizeServices(workshop.services.map((item) => item.category.name)),
        mobile: Boolean(workshop.mobileService),
        featured: Boolean(workshop.featured),
        source: workshop.sourceName ?? "Google Maps",
        placeId: workshop.externalPlaceId ?? `db-${workshop.id}`,
        responseTimeLabel,
      };
    });
  } catch {
    return null;
  }
}

export async function getMechanics(): Promise<Mechanic[]> {
  const dbMechanics = await loadDbMechanics();
  return dbMechanics?.length ? dbMechanics : staticMechanics;
}

export async function getMechanicBySlug(slug: string) {
  const mechanics = await getMechanics();
  return mechanics.find((item) => item.slug === slug) ?? null;
}

export async function getRelatedMechanics(mechanic: Mechanic, limit = 3) {
  const mechanics = await getMechanics();
  return mechanics.filter((item) => item.city === mechanic.city && item.slug !== mechanic.slug).slice(0, limit);
}

export function filterMechanics(mechanics: Mechanic[], filters: { city?: string | null; service?: string | null; mobileOnly?: boolean }) {
  return mechanics.filter((mechanic) => {
    const cityMatch = !filters.city || mechanic.city.toLowerCase() === filters.city.toLowerCase();
    const serviceMatch = !filters.service || mechanic.services.some((service) => service.toLowerCase() === filters.service?.toLowerCase());
    const mobileMatch = !filters.mobileOnly || mechanic.mobile;
    return cityMatch && serviceMatch && mobileMatch;
  });
}

export async function getHomePageData() {
  const mechanics = await getMechanics();
  const cityHighlights = buildCityHighlights(mechanics);
  const serviceCategories = buildServiceCategories(mechanics);

  return {
    mechanics,
    featuredMechanics: mechanics.filter((item) => item.featured).slice(0, 6),
    cityHighlights,
    serviceCategories,
    metrics: buildMetrics(mechanics),
    priceBenchmarks,
    subscriptionPlans
  };
}

export async function getDirectoryPageData(filters: { city?: string | null; service?: string | null; mobileOnly?: boolean }) {
  const mechanics = await getMechanics();
  return {
    mechanics,
    filteredMechanics: filterMechanics(mechanics, filters),
    cityHighlights: buildCityHighlights(mechanics),
    serviceCategories: buildServiceCategories(mechanics)
  };
}

export async function getCityHighlights() {
  return buildCityHighlights(await getMechanics());
}

export async function getServiceCategories() {
  return buildServiceCategories(await getMechanics());
}
