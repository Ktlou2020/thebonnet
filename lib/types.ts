export type Accreditation = "MIWA" | "RMI" | "R2R" | "AA Quality Assured";

export type ServiceCategory =
  | "General Service"
  | "Brakes"
  | "Diagnostics"
  | "Suspension"
  | "Transmission"
  | "Panel & Paint"
  | "Aircon"
  | "EV & Hybrid"
  | "Mobile Mechanic";

export interface Metric {
  label: string;
  value: string;
  detail: string;
}

export interface Mechanic {
  id: string;
  slug: string;
  name: string;
  city: string;
  province: string;
  serviceRadiusKm: number;
  rating: number;
  reviewCount: number;
  yearsInBusiness: number;
  responseTime: string;
  priceLevel: "Budget" | "Fair" | "Premium";
  hourlyRate: number;
  verified: boolean;
  mobile: boolean;
  whatsapp: string;
  badges: string[];
  accreditations: Accreditation[];
  makes: string[];
  services: ServiceCategory[];
  warranty: string;
  about: string;
  leadPlan: "Free" | "Growth" | "Pro";
  featured: boolean;
}

export interface PriceBenchmark {
  id: string;
  job: string;
  vehicle: string;
  independentAverage: number;
  low: number;
  high: number;
  dealershipAverage: number;
  confidence: "High" | "Medium";
}

export interface SubscriptionPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
}
