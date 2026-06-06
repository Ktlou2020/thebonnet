"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Check } from "lucide-react";

const SERVICE_OPTIONS = [
  "Car Repair",
  "Tyres",
  "Panel & Paint",
  "Diagnostics",
  "Brakes",
  "Suspension",
  "Transmission",
  "General Service",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type HoursEntry = { open: string; close: string; enabled: boolean };
type Hours = Record<string, HoursEntry>;

const defaultHours = (): Hours => {
  const h: Hours = {};
  for (const d of DAYS) {
    h[d] = { open: "08:00", close: "17:00", enabled: true };
  }
  h["Sunday"] = { open: "09:00", close: "13:00", enabled: false };
  return h;
};

export default function OnboardingPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? session?.user?.email ?? "there";
  const firstName = userName.split(" ")[0];

  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  // Step 1 state
  const [name, setName] = useState(firstName);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Step 2 state
  const [services, setServices] = useState<string[]>([]);

  // Step 3 state
  const [hours, setHours] = useState<Hours>(defaultHours());

  function toggleService(s: string) {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function updateHour(day: string, field: "open" | "close" | "enabled", value: string | boolean) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  async function finish() {
    // Attempt to save via dashboard PATCH if session exists
    try {
      await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          addressLine1: address,
          listingTypes: services,
          openingHours: hours,
        }),
      });
    } catch {
      // Proceed regardless
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-ink text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-fire/20">
            <Check className="h-8 w-8 text-fire" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Setup complete!</h1>
          <p className="text-slate-400 mb-8">Your workshop is ready. Head to your dashboard to manage leads and update your profile.</p>
          <Link
            href="/dashboard"
            className="inline-flex rounded-full bg-fire px-8 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
          >
            Go to dashboard →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-white flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full">
        {/* Progress indicator */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-fire uppercase tracking-widest mb-3">
            Step {step} of 3
          </p>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  s <= step ? "bg-fire" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Basic info */}
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold mb-2">Basic info</h1>
            <p className="text-slate-400 mb-8">Tell us about your workshop so drivers can find you.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Workshop name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cape Auto Repairs"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-fire focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 021 555 1234"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-fire focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 12 Main Road, Cape Town"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-fire focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!name}
                className="rounded-full bg-fire px-8 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Services */}
        {step === 2 && (
          <div>
            <h1 className="text-3xl font-bold mb-2">Services offered</h1>
            <p className="text-slate-400 mb-8">Select all the services your workshop provides.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SERVICE_OPTIONS.map((s) => {
                const selected = services.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleService(s)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      selected
                        ? "border-fire bg-fire/10 text-fire"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                    }`}
                  >
                    {selected && <Check className="inline h-3.5 w-3.5 mr-1.5" />}
                    {s}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-white/20"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="rounded-full bg-fire px-8 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Hours */}
        {step === 3 && (
          <div>
            <h1 className="text-3xl font-bold mb-2">Opening hours</h1>
            <p className="text-slate-400 mb-8">Set your regular trading hours.</p>
            <div className="space-y-3">
              {[...DAYS, "Sunday"].map((day) => {
                const h = hours[day];
                return (
                  <div key={day} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={h.enabled}
                      onChange={(e) => updateHour(day, "enabled", e.target.checked)}
                      className="accent-fire h-4 w-4 shrink-0"
                    />
                    <span className="w-24 text-sm font-medium text-slate-300 shrink-0">{day}</span>
                    {h.enabled ? (
                      <div className="flex items-center gap-2 ml-auto">
                        <input
                          type="time"
                          value={h.open}
                          onChange={(e) => updateHour(day, "open", e.target.value)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:border-fire focus:outline-none"
                        />
                        <span className="text-slate-500 text-xs">to</span>
                        <input
                          type="time"
                          value={h.close}
                          onChange={(e) => updateHour(day, "close", e.target.value)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:border-fire focus:outline-none"
                        />
                      </div>
                    ) : (
                      <span className="ml-auto text-xs text-slate-500">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-white/20"
              >
                ← Back
              </button>
              <button
                onClick={finish}
                className="rounded-full bg-fire px-8 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
              >
                Complete setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
