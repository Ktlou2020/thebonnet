import { PriceBenchmark } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function PriceCard({ item }: { item: PriceBenchmark }) {
  const savings = item.dealershipAverage - item.independentAverage;

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.15em] text-accent">{item.job}</p>
      <h3 className="mt-2 text-xl font-semibold text-slate-950">{item.vehicle}</h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Independent average</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrency(item.independentAverage)}</p>
          <p className="mt-2 text-sm text-slate-500">Range {formatCurrency(item.low)} – {formatCurrency(item.high)}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-emerald-700">Potential savings</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-900">{formatCurrency(savings)}</p>
          <p className="mt-2 text-sm text-emerald-700">vs dealership average {formatCurrency(item.dealershipAverage)}</p>
        </div>
      </div>
      <p className="mt-5 text-sm text-slate-500">Confidence: {item.confidence} · Built for quote comparison and pricing trust.</p>
    </div>
  );
}
