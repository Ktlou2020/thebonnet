export const JOBURG_NORTH = [
  "Sandton",
  "Randburg",
  "Fourways",
  "Midrand",
  "Bryanston",
  "Sunninghill",
  "Rivonia",
  "Morningside",
] as const;

export const JOBURG_WEST = [
  "Roodepoort",
  "Florida",
  "Weltevreden Park",
  "Northcliff",
  "Cresta",
  "Honeydew",
  "Northgate",
  "Krugersdorp",
] as const;

export const SERVICE_AREAS = [...JOBURG_NORTH, ...JOBURG_WEST] as const;
export type ServiceArea = (typeof SERVICE_AREAS)[number];

export const AREA_TO_REGION: Record<ServiceArea, "Joburg North" | "Joburg West"> = {
  Sandton: "Joburg North",
  Randburg: "Joburg North",
  Fourways: "Joburg North",
  Midrand: "Joburg North",
  Bryanston: "Joburg North",
  Sunninghill: "Joburg North",
  Rivonia: "Joburg North",
  Morningside: "Joburg North",
  Roodepoort: "Joburg West",
  Florida: "Joburg West",
  "Weltevreden Park": "Joburg West",
  Northcliff: "Joburg West",
  Cresta: "Joburg West",
  Honeydew: "Joburg West",
  Northgate: "Joburg West",
  Krugersdorp: "Joburg West",
};

// For dropdowns that need a freeform fallback
export const SERVICE_AREAS_WITH_OTHER = [...SERVICE_AREAS, "Other"] as const;
