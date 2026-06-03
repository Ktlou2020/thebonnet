"use client";

import Link from "next/link";
import { calculateProfileScore } from "@/lib/profile-score";

type WorkshopScoreProps = {
  imageUrl?: string | null;
  openingHours?: unknown;
  phone?: string | null;
  whatsapp?: string | null;
  description?: string | null;
  listingTypes?: string[];
  isVerified?: boolean;
};

export function ProfileScoreCard({ workshop }: { workshop: WorkshopScoreProps }) {
  const { items, score, maxScore } = calculateProfileScore(workshop);
  const pct = Math.round((score / maxScore) * 100);

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-950">
          Profile{" "}
          <span className="text-fire">{pct}%</span> complete
        </h2>
        <span className="text-sm text-slate-500">{score}/{maxScore} pts</span>
      </div>

      <div className="mb-5 h-3 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-fire transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.key} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              {item.done ? (
                <span className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold shrink-0">✓</span>
              ) : (
                <span className="h-4 w-4 rounded-full bg-slate-100 flex items-center justify-center shrink-0" />
              )}
              <span className={item.done ? "text-slate-700" : "text-slate-500"}>{item.label}</span>
            </div>
            {!item.done && item.action && (
              <Link
                href={item.action}
                className="text-xs font-semibold text-fire hover:underline shrink-0"
              >
                Fix →
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
