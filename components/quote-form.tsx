"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import { ServiceCategory } from "@/lib/types";

type BenchmarkResult = {
  low: number;
  high: number;
  currency: string;
  service: string;
  city: string;
} | null;

function buildInitialState(initialCity?: string, initialService?: string) {
  return {
    fullName: "",
    phone: "",
    email: "",
    city: initialCity ?? "",
    location: initialCity ?? "",
    vehicle: "",
    serviceNeeded: initialService ?? "",
    urgency: "This week",
    details: ""
  };
}

export function QuoteForm({
  cityOptions,
  serviceOptions,
  initialCity,
  initialService
}: {
  cityOptions: string[];
  serviceOptions: ServiceCategory[];
  initialCity?: string;
  initialService?: string;
}) {
  const startingState = useMemo(() => buildInitialState(initialCity, initialService), [initialCity, initialService]);
  const [form, setForm] = useState(startingState);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [benchmark, setBenchmark] = useState<BenchmarkResult>(null);

  useEffect(() => {
    if (!form.serviceNeeded) { setBenchmark(null); return; }
    const params = new URLSearchParams({ service: form.serviceNeeded });
    if (form.city) params.set("city", form.city);
    fetch(`/api/price-benchmark?${params.toString()}`)
      .then((r) => r.json())
      .then((data: { benchmark: BenchmarkResult }) => setBenchmark(data.benchmark ?? null))
      .catch(() => setBenchmark(null));
  }, [form.serviceNeeded, form.city]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      setStatus(payload.message ?? "Your request has been received.");
      setForm(buildInitialState(initialCity, initialService));
    } catch {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
        <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Full name" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" required />
        <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="WhatsApp or phone" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" required />
        <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email address" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" required />
        <select value={form.city} onChange={(event) => { const city = event.target.value; setForm({ ...form, city, location: form.location || city }); }} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent">
          <option value="">Select city</option>
          {cityOptions.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Suburb or area" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" required />
        <input value={form.vehicle} onChange={(event) => setForm({ ...form, vehicle: event.target.value })} placeholder="Vehicle make, model, and year" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" required />
        <select value={form.serviceNeeded} onChange={(event) => setForm({ ...form, serviceNeeded: event.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" required>
          <option value="">Select service needed</option>
          {serviceOptions.map((service) => (
            <option key={service} value={service}>{service}</option>
          ))}
          <option value="Other">Other</option>
        </select>
        <select value={form.urgency} onChange={(event) => setForm({ ...form, urgency: event.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent">
          <option>Today</option>
          <option>This week</option>
          <option>Flexible</option>
        </select>
      </div>
      {/* Price benchmark banner */}
      {benchmark && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          <span className="font-semibold">💡 Price insight: </span>
          Independent workshops in {benchmark.city} typically charge{" "}
          <span className="font-semibold">R{(benchmark.low / 100).toLocaleString("en-ZA")}–R{(benchmark.high / 100).toLocaleString("en-ZA")}</span>{" "}
          for {benchmark.service}.
        </div>
      )}
      <textarea value={form.details} onChange={(event) => setForm({ ...form, details: event.target.value })} placeholder="Describe the issue, symptoms, warning lights, noises, or anything the mechanic should know" rows={5} className="rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Your request is stored in the platform database when connected and can be routed to matching workshops as The Bonnet grows.</p>
        <button type="submit" disabled={loading} className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-bonnet disabled:opacity-60">
          {loading ? "Sending request..." : "Request quotes"}
        </button>
      </div>
      {status ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{status}</div> : null}
    </form>
  );
}
