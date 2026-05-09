import { Mechanic, Metric, PriceBenchmark, ServiceCategory, SubscriptionPlan } from "@/lib/types";

export const metrics: Metric[] = [
  { label: "Verified workshops", value: "420+", detail: "Designed for manual verification and claim flows" },
  { label: "Avg response time", value: "12 min", detail: "Lead-routing, WhatsApp alerts, and response score" },
  { label: "Quote savings", value: "Up to 38%", detail: "Compared with dealership benchmarks by job type" },
  { label: "Coverage target", value: "9 provinces", detail: "City-by-city rollout with quality gates" }
];

export const serviceCategories: ServiceCategory[] = [
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

export const mechanics: Mechanic[] = [
  {
    id: "1",
    slug: "jozi-auto-squad",
    name: "Jozi Auto Squad",
    city: "Johannesburg",
    province: "Gauteng",
    serviceRadiusKm: 25,
    rating: 4.9,
    reviewCount: 187,
    yearsInBusiness: 14,
    responseTime: "8 min",
    priceLevel: "Fair",
    hourlyRate: 560,
    verified: true,
    mobile: true,
    whatsapp: "+27 72 555 0142",
    badges: ["Top Rated", "Fast Response", "Fleet Ready"],
    accreditations: ["MIWA", "RMI", "R2R"],
    makes: ["Toyota", "Volkswagen", "Ford", "BMW"],
    services: ["General Service", "Diagnostics", "Brakes", "Mobile Mechanic"],
    warranty: "6 months labour warranty",
    about: "Independent workshop with mobile support for commuters, fleets, and urgent callouts in Joburg North.",
    leadPlan: "Pro",
    featured: true
  },
  {
    id: "2",
    slug: "cape-torque-garage",
    name: "Cape Torque Garage",
    city: "Cape Town",
    province: "Western Cape",
    serviceRadiusKm: 18,
    rating: 4.8,
    reviewCount: 133,
    yearsInBusiness: 11,
    responseTime: "14 min",
    priceLevel: "Premium",
    hourlyRate: 690,
    verified: true,
    mobile: false,
    whatsapp: "+27 82 555 0193",
    badges: ["BMW Specialist", "Warranty Friendly"],
    accreditations: ["MIWA", "R2R"],
    makes: ["BMW", "Mercedes-Benz", "Audi", "Volkswagen"],
    services: ["Diagnostics", "Transmission", "Suspension", "Aircon"],
    warranty: "12 months on fitted parts",
    about: "Premium independent workshop for German brands with transparent diagnostics and repair approvals.",
    leadPlan: "Growth",
    featured: true
  },
  {
    id: "3",
    slug: "durban-driveworks",
    name: "Durban DriveWorks",
    city: "Durban",
    province: "KwaZulu-Natal",
    serviceRadiusKm: 22,
    rating: 4.7,
    reviewCount: 96,
    yearsInBusiness: 9,
    responseTime: "18 min",
    priceLevel: "Budget",
    hourlyRate: 470,
    verified: true,
    mobile: true,
    whatsapp: "+27 73 555 0164",
    badges: ["Mobile Team", "Weekend Slots"],
    accreditations: ["RMI", "R2R"],
    makes: ["Toyota", "Nissan", "Hyundai", "Kia"],
    services: ["General Service", "Brakes", "Aircon", "Mobile Mechanic"],
    warranty: "90-day workmanship guarantee",
    about: "High-conversion mobile and workshop hybrid business serving Durban North, Umhlanga, and surrounding suburbs.",
    leadPlan: "Growth",
    featured: false
  },
  {
    id: "4",
    slug: "pretoria-ev-lab",
    name: "Pretoria EV Lab",
    city: "Pretoria",
    province: "Gauteng",
    serviceRadiusKm: 30,
    rating: 4.9,
    reviewCount: 61,
    yearsInBusiness: 6,
    responseTime: "11 min",
    priceLevel: "Premium",
    hourlyRate: 820,
    verified: true,
    mobile: false,
    whatsapp: "+27 78 555 0105",
    badges: ["EV Specialist", "Advanced Diagnostics"],
    accreditations: ["MIWA", "RMI", "AA Quality Assured"],
    makes: ["Tesla", "BYD", "Volvo", "BMW"],
    services: ["EV & Hybrid", "Diagnostics", "Suspension"],
    warranty: "12 months on EV battery-related labour",
    about: "Specialist EV and hybrid workshop built for the next wave of South African aftersales demand.",
    leadPlan: "Pro",
    featured: true
  },
  {
    id: "5",
    slug: "gqeberha-panel-tech",
    name: "Gqeberha Panel Tech",
    city: "Gqeberha",
    province: "Eastern Cape",
    serviceRadiusKm: 15,
    rating: 4.6,
    reviewCount: 74,
    yearsInBusiness: 18,
    responseTime: "26 min",
    priceLevel: "Fair",
    hourlyRate: 540,
    verified: true,
    mobile: false,
    whatsapp: "+27 76 555 0111",
    badges: ["Insurance Approved", "Panel & Paint"],
    accreditations: ["RMI"],
    makes: ["Ford", "Toyota", "Volkswagen"],
    services: ["Panel & Paint", "Suspension", "Brakes"],
    warranty: "Lifetime paint adhesion warranty",
    about: "Collision repair and restoration shop with image-based estimates and insurer-ready documentation.",
    leadPlan: "Free",
    featured: false
  },
  {
    id: "6",
    slug: "bloem-brake-clinic",
    name: "Bloem Brake Clinic",
    city: "Bloemfontein",
    province: "Free State",
    serviceRadiusKm: 20,
    rating: 4.8,
    reviewCount: 58,
    yearsInBusiness: 10,
    responseTime: "20 min",
    priceLevel: "Budget",
    hourlyRate: 430,
    verified: true,
    mobile: false,
    whatsapp: "+27 79 555 0127",
    badges: ["Brake Experts", "Transparent Pricing"],
    accreditations: ["MIWA", "R2R"],
    makes: ["Suzuki", "Toyota", "Ford", "Isuzu"],
    services: ["Brakes", "General Service", "Suspension"],
    warranty: "6 months on brake labour",
    about: "Focused service-line workshop with excellent margins on recurring preventative maintenance and brake jobs.",
    leadPlan: "Growth",
    featured: false
  }
];

export const priceBenchmarks: PriceBenchmark[] = [
  {
    id: "1",
    job: "Brake pad replacement",
    vehicle: "VW Polo 1.2 TSI",
    independentAverage: 2200,
    low: 1800,
    high: 2800,
    dealershipAverage: 4800,
    confidence: "High"
  },
  {
    id: "2",
    job: "Minor service",
    vehicle: "Toyota Hilux 2.8 GD-6",
    independentAverage: 3150,
    low: 2550,
    high: 4100,
    dealershipAverage: 5800,
    confidence: "High"
  },
  {
    id: "3",
    job: "Aircon re-gas",
    vehicle: "Ford Ranger 3.2 TDCi",
    independentAverage: 1450,
    low: 1100,
    high: 1900,
    dealershipAverage: 2750,
    confidence: "Medium"
  },
  {
    id: "4",
    job: "Diagnostics scan",
    vehicle: "BMW 320d F30",
    independentAverage: 950,
    low: 700,
    high: 1400,
    dealershipAverage: 2200,
    confidence: "High"
  }
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    name: "Free",
    price: "R0",
    description: "Claim a profile and start capturing intent.",
    features: [
      "Basic workshop profile",
      "Limited quote responses",
      "Public reviews",
      "Claim and verify phone number"
    ],
    cta: "Claim profile"
  },
  {
    name: "Growth",
    price: "R799/mo",
    description: "For independent workshops that want consistent inbound leads.",
    features: [
      "Priority in city search",
      "Lead inbox + WhatsApp notifications",
      "Performance analytics",
      "Review request automation",
      "3 promoted service categories"
    ],
    cta: "Start Growth"
  },
  {
    name: "Pro",
    price: "R1,499/mo",
    description: "For high-volume workshops and specialists buying share of market.",
    features: [
      "Sponsored placement slots",
      "Fleet and emergency lead access",
      "Multi-branch management",
      "Quote templates and response scoring",
      "Advanced accreditation trust cards"
    ],
    cta: "Start Pro"
  }
];
