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
  responseTimeLabel?: string;
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
  period?: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export type ConsumerPlan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

export type GarageVehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  variant?: string;
  colour?: string;
  nickname?: string;
  registrationNo?: string;
  currentMileage?: number;
  notes?: string;
  createdAt: string;
};

export type GarageServiceRecord = {
  id: string;
  vehicleId: string;
  serviceType: string;
  date: string;
  mileageAtService?: number;
  workshopName?: string;
  city?: string;
  totalCostCents?: number;
  labourCents?: number;
  partsCents?: number;
  notes?: string;
  createdAt: string;
};

export type UrgencyLevel = "routine" | "soon" | "urgent" | "emergency";

export type AiDiagnosisResult = {
  likelyCauses: Array<{
    cause: string;
    likelihood: "high" | "medium" | "low";
    explanation: string;
  }>;
  urgencyLevel: UrgencyLevel;
  urgencyNote: string;
  estimatedCost: {
    low: number;
    high: number;
    currency: string;
    note: string;
  };
  partsInvolved: string[];
  questionsToAsk: string[];
  mechanicBrief: string;
};
