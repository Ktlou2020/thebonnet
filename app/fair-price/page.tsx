"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Info, Search, TrendingDown } from "lucide-react";
import { priceBenchmarks } from "@/lib/workshops";
import { PriceCard } from "@/components/price-card";

const CATEGORIES = [
  "All services",
  "Brakes",
  "Oils & Filters",
  "Tyres & Wheels",
  "Aircon",
  "Electrical",
  "Engine & Timing",
  "Suspension",
  "Clutch & Gearbox",
  "Cooling System",
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Brakes": ["brake"],
  "Oils & Filters": ["oil", "filter", "service"],
  "Tyres & Wheels": ["wheel", "tyre", "alignment", "balanc"],
  "Aircon": ["aircon", "ac", "refrigerant"],
  "Electrical": ["battery", "electrical", "starter"],
  "Engine & Timing": ["spark", "timing", "major service", "tune"],
  "Suspension": ["shock", "suspension", "strut"],
  "Clutch & Gearbox": ["clutch", "gearbox", "transmission"],
  "Cooling System": ["radiator", "coolant", "water pump", "thermostat"],
};

function matchCategory(job: string, category: string): boolean {
  if (category === "All services") return true;
  const keywords = CATEGORY_KEYWORDS[category] ?? [];
  const lower = job.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

const totalSavings = priceBenchmarks.reduce(
  (sum, b) => sum + (b.dealershipAverage - b.independentAverage),
  0
);
const avgSavings = Math.round(totalSavings / priceBenchmarks.length);

export default function FairPricePage() {
  const [category, setCategory] = useState("All services");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    return priceBenchmarks.filter((b) => {
      const matchesCat = matchCategory(b.job, category);
      const matchesQ = !query || b.job.toLowerCase().includes(query.toLowerCase()) || b.vehicle.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQ;
    });
  }, [category, query]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-ink px-6 py-16 text-white lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90">
            <TrendingDown className="h-4 w-4 text-accent" />
            Fair Price Index — South Africa
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
            Know what to pay<br />
            <span className="bg-gradient-to-r from-fire to-amber-400 bg-clip-text text-transparent">before you book.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Independent workshop pricing for common SA auto services. Compare dealer rates vs. independent mechanics and see how much you can save.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6 sm:w-fit">
            <div>
              <div className="text-3xl font-bold text-fire">{priceBenchmarks.length}</div>
              <div className="mt-1 text-sm text-slate-400">Services tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-fire">R{avgSavings.toLocaleString()}</div>
              <div className="mt-1 text-sm text-slate-400">Avg saving vs dealer</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-fire">High</div>
              <div className="mt-1 text-sm text-slate-400">Confidence</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Search & filter */}
        <div className="sticky top-20 z-10 rounded-[2rem] border border-slate-200 bg-white/95 p-4 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by service or vehicle…"
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-fire"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    category === cat
                      ? "bg-fire text-white shadow-glow-fire"
                      : "border border-slate-200 text-slate-600 hover:border-fire hover:text-fire"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6">
          {results.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-12 text-center">
              <div className="text-4xl">🔍</div>
              <h3 className="mt-4 font-semibold text-slate-900">No matching services</h3>
              <p className="mt-2 text-sm text-slate-500">Try a different category or clear your search.</p>
              <button onClick={() => { setQuery(""); setCategory("All services"); }} className="mt-4 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">Clear filters</button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {results.map((item) => <PriceCard key={item.id} item={item} />)}
            </div>
          )}
        </div>

        {/* Methodology note */}
        <div className="mt-10 flex gap-3 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div className="text-sm leading-7 text-slate-600">
            <span className="font-semibold text-slate-900">How we build these benchmarks:</span> Prices are sourced from accepted quotes on the My Bonnet platform, workshop surveys, and publicly available service price lists across Cape Town, Johannesburg, and Durban. Prices vary by vehicle age, parts grade, and workshop location. Always compare at least two quotes before booking.
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-[2rem] bg-ink px-8 py-10 text-center text-white">
          <h2 className="text-2xl font-bold">Ready to get a quote?</h2>
          <p className="mt-3 text-slate-400">Send one request and get competing quotes from verified workshops near you.</p>
          <Link href="/request-quote" className="mt-6 inline-flex items-center gap-2 rounded-full bg-fire px-7 py-3.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90">
            Request quotes now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
