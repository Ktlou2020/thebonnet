"use client";

import { useMemo, useState, useEffect } from "react";
import { Car, Check, MapPin, User, Wrench } from "lucide-react";
import { useSession } from "next-auth/react";
import type { ServiceCategory } from "@/lib/types";

interface GarageVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  colour?: string | null;
  nickname?: string | null;
}

const STEPS = [
  { id: 1, label: "Location", icon: MapPin },
  { id: 2, label: "Service", icon: Wrench },
  { id: 3, label: "Vehicle", icon: Car },
  { id: 4, label: "Contact", icon: User },
] as const;

function initialState(initialCity?: string, initialService?: string) {
  return {
    fullName: "",
    phone: "",
    email: "",
    city: initialCity ?? "",
    location: "",
    vehicle: "",
    serviceNeeded: initialService ?? "",
    urgency: "This week",
    details: "",
  };
}

export function QuoteWizard({
  cityOptions,
  serviceOptions,
  initialCity,
  initialService,
}: {
  cityOptions: string[];
  serviceOptions: ServiceCategory[];
  initialCity?: string;
  initialService?: string;
}) {
  const start = useMemo(() => initialState(initialCity, initialService), [initialCity, initialService]);
  const [form, setForm] = useState(start);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const { data: session } = useSession();
  const [garageVehicles, setGarageVehicles] = useState<GarageVehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [manualEntry, setManualEntry] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/garage")
      .then((r) => r.json())
      .then((d: { vehicles?: GarageVehicle[] }) => {
        if (d.vehicles?.length) setGarageVehicles(d.vehicles);
        else setManualEntry(true);
      })
      .catch(() => setManualEntry(true));
  }, [session]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const canNext =
    (step === 1 && !!form.city) ||
    (step === 2 && !!form.serviceNeeded) ||
    (step === 3 && !!form.vehicle) ||
    step === 4;

  const stepHint =
    step === 1 && !form.city ? "Select your city to continue" :
    step === 2 && !form.serviceNeeded ? "Choose a service type to continue" :
    step === 3 && !form.vehicle ? "Enter your vehicle details to continue" :
    step === 4 && (!form.fullName || !form.phone || !form.email) ? "Fill in your name, phone and email to send" :
    null;

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await res.json().catch(() => ({}));
      setDone(payload.message ?? "Your request has been received. Matching workshops will be in touch.");
    } catch {
      setDone("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-soft">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-slate-950">Your quote request is on its way!</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
          Workshops in your area will respond within a few hours. Most quotes come in within 2 hours during business hours.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="/quotes" className="inline-flex items-center gap-2 rounded-full bg-fire px-6 py-3 text-sm font-semibold text-white shadow-glow-fire">
            Track my quotes →
          </a>
          <a href="/mechanics" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
            Browse mechanics
          </a>
        </div>
        <div className="mx-auto mt-6 max-w-md rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-left">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Tip:</span> Accept the quote that best fits your budget. You can message the workshop directly once you accept.
          </p>
        </div>
      </div>
    );
  }

  const inputCls = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fire";

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.id;
            const complete = step > s.id;
            return (
              <div key={s.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full transition ${complete ? "bg-accent text-white" : active ? "bg-fire text-white shadow-glow-fire" : "bg-slate-100 text-slate-400"}`}>
                    {complete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`mt-2 text-xs font-semibold ${active || complete ? "text-slate-900" : "text-slate-400"}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`mx-2 h-0.5 flex-1 ${complete ? "bg-accent" : "bg-slate-200"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[220px]">
        {step === 1 && (
          <div className="grid gap-4">
            <h2 className="text-xl font-bold text-slate-950">Where are you?</h2>
            <label className="text-sm font-medium text-slate-700">City
              <select value={form.city} onChange={(e) => set("city", e.target.value)} className={`mt-1 ${inputCls}`}>
                <option value="">Select city</option>
                {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">Suburb or area
              <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Sea Point" className={`mt-1 ${inputCls}`} />
            </label>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-4">
            <h2 className="text-xl font-bold text-slate-950">What do you need?</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {[...serviceOptions, "Other" as ServiceCategory].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("serviceNeeded", s)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${form.serviceNeeded === s ? "border-fire bg-fire/5 text-fire" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <label className="text-sm font-medium text-slate-700">How urgent?
              <select value={form.urgency} onChange={(e) => set("urgency", e.target.value)} className={`mt-1 ${inputCls}`}>
                <option>Today</option><option>This week</option><option>Flexible</option>
              </select>
            </label>
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-4">
            <h2 className="text-xl font-bold text-slate-950">Tell us about your vehicle</h2>
            {garageVehicles.length > 0 && !manualEntry ? (
              <>
                <p className="text-sm text-slate-500">Select from My Garage or enter manually.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {garageVehicles.map((v) => {
                    const label = `${v.year} ${v.make} ${v.model}${v.colour ? ` · ${v.colour}` : ""}`;
                    const selected = selectedVehicleId === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVehicleId(v.id);
                          set("vehicle", label);
                        }}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${selected ? "border-fire bg-fire/5 text-fire" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}
                      >
                        <span className="block font-semibold">{v.nickname ?? `${v.make} ${v.model}`}</span>
                        <span className="block text-xs text-slate-400">{v.year}{v.colour ? ` · ${v.colour}` : ""}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedVehicleId(null); set("vehicle", ""); setManualEntry(true); }}
                  className="text-xs text-slate-400 underline text-left hover:text-slate-600"
                >
                  Enter a different vehicle manually
                </button>
              </>
            ) : (
              <>
                <label className="text-sm font-medium text-slate-700">Make, model &amp; year
                  <input value={form.vehicle} onChange={(e) => set("vehicle", e.target.value)} placeholder="e.g. 2019 VW Polo 1.4" className={`mt-1 ${inputCls}`} />
                </label>
                {garageVehicles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setManualEntry(false); set("vehicle", ""); }}
                    className="text-xs text-fire underline text-left hover:text-fire/80"
                  >
                    ← Select from My Garage
                  </button>
                )}
              </>
            )}
            <label className="text-sm font-medium text-slate-700">Describe the issue (optional)
              <textarea value={form.details} onChange={(e) => set("details", e.target.value)} rows={3} placeholder="Symptoms, warning lights, noises…" className={`mt-1 ${inputCls} resize-none`} />
            </label>
          </div>
        )}
        {step === 4 && (
          <div className="grid gap-4">
            <h2 className="text-xl font-bold text-slate-950">How can workshops reach you?</h2>
            <label className="text-sm font-medium text-slate-700">Full name
              <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Your name" className={`mt-1 ${inputCls}`} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Phone / WhatsApp
                <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0xx xxx xxxx" className={`mt-1 ${inputCls}`} />
              </label>
              <label className="text-sm font-medium text-slate-700">Email
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" className={`mt-1 ${inputCls}`} />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="mt-8 flex flex-col gap-3">
        {stepHint && (
          <p className="text-center text-xs font-medium text-slate-400">{stepHint}</p>
        )}
        <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:opacity-40"
        >
          Back
        </button>
        {step < 4 ? (
          <button
            type="button"
            onClick={() => canNext && setStep((s) => s + 1)}
            disabled={!canNext}
            className="rounded-full bg-fire px-6 py-2.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={loading || !form.fullName || !form.phone || !form.email}
            className="rounded-full bg-fire px-6 py-2.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40"
          >
            {loading ? "Sending…" : "Request quotes"}
          </button>
        )}
      </div>
      </div>
    </div>
  );
}
