import { WORKSHOP_BADGES } from "@/lib/gamification";

export function WorkshopBadges({ badges, size = "md" }: { badges: string[]; size?: "sm" | "md" }) {
  const resolved = badges
    .map((id) => WORKSHOP_BADGES.find((b) => b.id === id))
    .filter((b): b is (typeof WORKSHOP_BADGES)[number] => Boolean(b));

  if (resolved.length === 0) return null;

  const pad = size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs";

  return (
    <div className="flex flex-wrap gap-2">
      {resolved.map((b) => (
        <span
          key={b.id}
          title={b.desc}
          className={`inline-flex items-center gap-1.5 rounded-full bg-accent/10 font-semibold text-teal-700 ${pad}`}
        >
          <span aria-hidden>{b.icon}</span>
          {b.name}
        </span>
      ))}
    </div>
  );
}
