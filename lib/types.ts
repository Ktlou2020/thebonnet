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

export interface CityHighlight {
  city: string;
  province: string;
  count: number;
  slug: string;
}

export interface Mechanic {
  id: string;
  slug: string;
  name: string;
  city: string;
  province: string;
  address: string;
  phone?: string;
  website?: string;
  rating: number;
  hours: string;
  types: string[];
  services: ServiceCategory[];
  mobile: boolean;
  featured: boolean;
  source: string;
  placeId: string;
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
  note: string;
  source: string;
  sourceUrl: string;
}

export interface SubscriptionPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
}
