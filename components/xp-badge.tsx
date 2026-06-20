"use client";

import { getLevelProgress } from "@/lib/gamification";

export function XpBadge({ totalXp, compact = false }: { totalXp: number; compact?: boolean }) {
  const { current, next, pct, xpToNext } = getLevelProgress(totalXp);

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
        <span aria-hidden>{current.icon}</span>
        <span>{current.name}</span>
        <span className="text-slate-300">· {totalXp} XP</span>
      </span>
    );
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-semibold text-white">
          <span className="text-lg" aria-hidden>{current.icon}</span>
          {current.name} · Level {current.level}
        </span>
        <span className="text-slate-300">{totalXp} XP</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-fire transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        {next ? `${xpToNext} XP to ${next.name}` : "Max level reached — you're a Legend!"}
      </p>
    </div>
  );
}
