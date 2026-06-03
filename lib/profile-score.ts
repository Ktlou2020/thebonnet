export interface ProfileScoreItem {
  key: string;
  label: string;
  done: boolean;
  points: number;
  action?: string;
}

export function calculateProfileScore(workshop: {
  imageUrl?: string | null;
  openingHours?: unknown;
  phone?: string | null;
  whatsapp?: string | null;
  description?: string | null;
  listingTypes?: string[];
  isVerified?: boolean;
}): { items: ProfileScoreItem[]; score: number; maxScore: number } {
  const items: ProfileScoreItem[] = [
    { key: "photo", label: "Cover photo uploaded", done: Boolean(workshop.imageUrl), points: 20, action: "/dashboard?tab=settings" },
    { key: "hours", label: "Opening hours set", done: Boolean(workshop.openingHours), points: 15, action: "/dashboard?tab=settings" },
    { key: "phone", label: "Phone number added", done: Boolean(workshop.phone || workshop.whatsapp), points: 15, action: "/dashboard?tab=settings" },
    { key: "description", label: "Description written (50+ chars)", done: Boolean(workshop.description && workshop.description.length > 50), points: 20, action: "/dashboard?tab=settings" },
    { key: "services", label: "Services listed (3+)", done: (workshop.listingTypes?.length ?? 0) >= 3, points: 20, action: "/dashboard?tab=settings" },
    { key: "verified", label: "Verification badge", done: Boolean(workshop.isVerified), points: 10, action: "/dashboard?tab=settings" },
  ];
  const score = items.filter(i => i.done).reduce((sum, i) => sum + i.points, 0);
  const maxScore = items.reduce((sum, i) => sum + i.points, 0);
  return { items, score, maxScore };
}
