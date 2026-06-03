"use client";

import { useEffect, useState } from "react";

type Stats = {
  workshopCount: number;
  reviewCount: number;
  cityCount: number;
  leadCount: number;
};

const FALLBACK: Stats = {
  workshopCount: 800,
  reviewCount: 2400,
  cityCount: 9,
  leadCount: 5000,
};

function useCountUp(target: number, duration = 1500): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setValue(Math.round((target * step) / steps));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

function StatItem({ label, value }: { label: string; value: number }) {
  const displayed = useCountUp(value);
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft text-center">
      <div className="text-4xl font-bold text-fire">{displayed.toLocaleString()}</div>
      <div className="mt-2 text-sm font-medium text-slate-600">{label}</div>
    </div>
  );
}

export function LiveStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json() as Promise<Stats>)
      .then(setStats)
      .catch(() => setStats(FALLBACK));
  }, []);

  const data = stats ?? FALLBACK;

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatItem label="Workshops" value={data.workshopCount} />
      <StatItem label="Reviews" value={data.reviewCount} />
      <StatItem label="Cities" value={data.cityCount} />
      <StatItem label="Quote Requests" value={data.leadCount} />
    </div>
  );
}
