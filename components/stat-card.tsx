import { Metric } from "@/lib/types";

export function StatCard({ item }: { item: Metric }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur transition hover:border-white/20 hover:bg-white/8">
      <div className="text-4xl font-bold tracking-tight">{item.value}</div>
      <div className="mt-2 text-sm font-semibold text-white/80">{item.label}</div>
      <p className="mt-2 text-xs leading-6 text-slate-400">{item.detail}</p>
    </div>
  );
}
