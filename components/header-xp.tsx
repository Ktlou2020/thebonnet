"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getDriverLevel } from "@/lib/gamification";

export function HeaderXp() {
  const { data: session } = useSession();
  const [xp, setXp] = useState<number | null>(null);

  useEffect(() => {
    if (!session) {
      setXp(null);
      return;
    }
    fetch("/api/xp")
      .then((r) => r.json())
      .then((d: { totalXp?: number }) => setXp(d.totalXp ?? 0))
      .catch(() => setXp(null));
  }, [session]);

  if (!session || xp === null) return null;
  const level = getDriverLevel(xp);

  return (
    <Link
      href="/garage"
      title={`${level.name} · ${xp} XP`}
      className="hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-white/30 sm:inline-flex"
    >
      <span aria-hidden>{level.icon}</span>
      <span>{xp} XP</span>
    </Link>
  );
}
