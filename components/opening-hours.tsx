"use client";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

type DayKey = (typeof DAY_KEYS)[number];

function isOpenNow(hours: Record<string, string | null> | null | undefined): boolean {
  if (!hours) return false;
  const now = new Date();
  const dayIndex = (now.getDay() + 6) % 7; // Mon=0
  const key = DAY_KEYS[dayIndex];
  const range = hours[key];
  if (!range) return false;
  const [openStr, closeStr] = range.split("-").map((s) => s.trim());
  if (!openStr || !closeStr) return false;
  const toMins = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };
  const current = now.getHours() * 60 + now.getMinutes();
  return current >= toMins(openStr) && current < toMins(closeStr);
}

export function OpeningHours({
  hours,
}: {
  hours: Record<string, string | null> | null | undefined;
}) {
  const now = new Date();
  const todayIndex = (now.getDay() + 6) % 7;
  const open = isOpenNow(hours);

  return (
    <div className="mt-8 rounded-[1.5rem] bg-slate-50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-950">Opening hours</h2>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${open ? "bg-green-500" : "bg-red-500"}`} />
          {open ? "Open now" : "Closed now"}
        </span>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {DAYS.map((day, i) => {
            const key = DAY_KEYS[i] as DayKey;
            const range = hours?.[key];
            const isToday = i === todayIndex;
            return (
              <tr
                key={day}
                className={`border-b border-slate-100 last:border-0 ${
                  isToday ? "text-fire font-semibold" : "text-slate-600"
                }`}
              >
                <td className="py-2 pr-4 w-28">{day}</td>
                <td className="py-2">{range ?? <span className="text-slate-400">Closed</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
