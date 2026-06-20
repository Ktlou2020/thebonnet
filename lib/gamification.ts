export const DRIVER_XP_ACTIONS = {
  REVIEW_WRITTEN: 100,
  SERVICE_LOGGED: 50,
  VEHICLE_ADDED: 25,
  REFERRAL_SENT: 150,
  FIRST_QUOTE: 75,
  PROFILE_COMPLETE: 50,
} as const;

export const DRIVER_LEVELS = [
  { level: 1, name: "Rookie Driver", minXp: 0, icon: "🚗" },
  { level: 2, name: "Regular Driver", minXp: 200, icon: "🔧" },
  { level: 3, name: "Road Warrior", minXp: 500, icon: "⚡" },
  { level: 4, name: "Pit Crew", minXp: 1000, icon: "🏁" },
  { level: 5, name: "Legend", minXp: 2500, icon: "🏆" },
] as const;

export const WORKSHOP_BADGES = [
  { id: "fast_responder", name: "Fast Responder", desc: "Responds within 1 hour", icon: "⚡" },
  { id: "top_rated", name: "Top Rated", desc: "4.8★ average rating", icon: "⭐" },
  { id: "verified", name: "Verified Workshop", desc: "Identity & credentials verified", icon: "✅" },
  { id: "century_club", name: "Century Club", desc: "100+ completed jobs", icon: "💯" },
  { id: "community_pick", name: "Community Pick", desc: "Recommended by 10+ drivers", icon: "❤️" },
  { id: "quick_quote", name: "Quick Quoter", desc: "90%+ quote response rate", icon: "📋" },
] as const;

export type DriverLevel = (typeof DRIVER_LEVELS)[number];
export type WorkshopBadge = (typeof WORKSHOP_BADGES)[number];

export function getDriverLevel(xp: number): DriverLevel {
  return [...DRIVER_LEVELS].reverse().find((l) => xp >= l.minXp) ?? DRIVER_LEVELS[0];
}

export function getNextDriverLevel(xp: number): DriverLevel | null {
  return DRIVER_LEVELS.find((l) => l.minXp > xp) ?? null;
}

export function getLevelProgress(xp: number): { current: DriverLevel; next: DriverLevel | null; pct: number; xpToNext: number } {
  const current = getDriverLevel(xp);
  const next = getNextDriverLevel(xp);
  if (!next) return { current, next: null, pct: 100, xpToNext: 0 };
  const span = next.minXp - current.minXp;
  const into = xp - current.minXp;
  const pct = Math.max(0, Math.min(100, Math.round((into / span) * 100)));
  return { current, next, pct, xpToNext: next.minXp - xp };
}

export function getWorkshopBadge(id: string): WorkshopBadge | undefined {
  return WORKSHOP_BADGES.find((b) => b.id === id);
}
