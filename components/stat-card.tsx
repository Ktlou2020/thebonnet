import { Metric } from "@/lib/types";

export function StatCard({ item }: { item: Metric }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-soft backdrop-blur">
      <div className="text-3xl font-semibold">{item.value}</div>
      <div className="mt-2 text-base font-medium text-white/90">{item.label}</div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
    </div>
  );
}
