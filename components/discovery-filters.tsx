"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export function DiscoveryFilters({
  cities,
  services,
}: {
  cities: { city: string; count: number }[];
  services: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const city = params.get("city") ?? "";
  const service = params.get("service") ?? "";
  const minRating = params.get("rating") ?? "";
  const verifiedOnly = params.get("verified") === "1";
  const sort = params.get("sort") ?? "featured";

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      router.push(`/mechanics${next.toString() ? `?${next.toString()}` : ""}`);
    },
    [params, router]
  );

  const hasFilters = city || service || minRating || verifiedOnly || sort !== "featured";

  return (
    <aside className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-sm font-bold text-slate-950">
          <SlidersHorizontal className="h-4 w-4 text-fire" /> Filters
        </h2>
        {hasFilters && (
          <button onClick={() => router.push("/mechanics")} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-fire">
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">City</label>
        <select
          value={city}
          onChange={(e) => update({ city: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fire"
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c.city} value={c.city}>{c.city} ({c.count})</option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Service type</p>
        <div className="space-y-2">
          {services.map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="service"
                checked={service === s}
                onChange={() => update({ service: s })}
                className="h-4 w-4 accent-fire"
              />
              {s}
            </label>
          ))}
          {service && (
            <button onClick={() => update({ service: null })} className="text-xs font-semibold text-fire hover:underline">
              Clear service
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Minimum rating</label>
        <select
          value={minRating}
          onChange={(e) => update({ rating: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fire"
        >
          <option value="">Any rating</option>
          <option value="4.5">4.5★ and up</option>
          <option value="4">4★ and up</option>
          <option value="3">3★ and up</option>
        </select>
      </div>

      <label className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700">
        Verified only
        <input
          type="checkbox"
          checked={verifiedOnly}
          onChange={(e) => update({ verified: e.target.checked ? "1" : null })}
          className="h-4 w-4 accent-fire"
        />
      </label>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Sort by</label>
        <select
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fire"
        >
          <option value="featured">Featured first</option>
          <option value="rating">Highest rated</option>
          <option value="reviews">Most reviewed</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>
    </aside>
  );
}
