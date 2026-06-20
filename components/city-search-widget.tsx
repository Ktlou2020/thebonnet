"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MapPin, Search, Wrench } from "lucide-react";

export function CitySearchWidget({
  cities,
  services,
}: {
  cities: string[];
  services: string[];
}) {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [service, setService] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (service) params.set("service", service);
    router.push(`/mechanics${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-[2rem] border border-white/15 bg-white/95 p-3 shadow-glow-fire backdrop-blur md:flex-row md:items-center md:rounded-full md:p-2"
    >
      <label className="flex flex-1 items-center gap-3 rounded-full px-5 py-3">
        <MapPin className="h-5 w-5 shrink-0 text-fire" />
        <span className="sr-only">Where are you?</span>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
        >
          <option value="">Where are you?</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <div className="hidden h-8 w-px bg-slate-200 md:block" />

      <label className="flex flex-1 items-center gap-3 rounded-full px-5 py-3">
        <Wrench className="h-5 w-5 shrink-0 text-fire" />
        <span className="sr-only">What do you need?</span>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
        >
          <option value="">What do you need?</option>
          {services.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-fire px-7 py-3.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
      >
        <Search className="h-4 w-4" /> Search
      </button>
    </form>
  );
}
