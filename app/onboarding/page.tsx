"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Car, MapPin, Wrench, ArrowRight, Loader2 } from "lucide-react";

// ─── Shared ──────────────────────────────────────────────────────────────────

const SA_CITIES = [
  "Cape Town", "Johannesburg", "Pretoria", "Durban", "Gqeberha",
  "East London", "Bloemfontein", "Nelspruit", "Polokwane", "Kimberley", "Other",
];

const CAR_MAKES = [
  "Toyota", "Volkswagen", "Ford", "Hyundai", "Suzuki", "Kia", "Renault",
  "BMW", "Mercedes-Benz", "Audi", "Nissan", "Isuzu", "Haval", "Chery", "GWM",
  "Honda", "Mazda", "Mitsubishi", "Peugeot", "Citroën", "Opel", "Other",
];

const YEARS = Array.from({ length: 26 }, (_, i) => 2025 - i);

const DRIVER_SERVICES = [
  "Oil & Filter Service",
  "Major / Full Service",
  "Tyres & Balancing",
  "Brakes",
  "Aircon",
  "Electrical",
  "Suspension & Shocks",
  "Clutch & Gearbox",
  "Body & Paint",
  "Diagnostics",
  "Roadworthy Certificate",
  "Windscreen",
];

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-fire mb-3">
        Step {current} of {total}
      </p>
      <div className="flex gap-2">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i + 1 <= current ? "bg-fire" : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-fire focus:outline-none transition";

// ─── Driver onboarding ────────────────────────────────────────────────────────

function DriverOnboarding({ userName }: { userName: string }) {
  const router = useRouter();
  const firstName = userName.split(" ")[0];

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Step 1: personal details
  const [name, setName] = useState(firstName !== "there" ? firstName : "");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  // Step 2: first vehicle
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [colour, setColour] = useState("");
  const [skipVehicle, setSkipVehicle] = useState(false);

  // Step 3: services they need
  const [services, setServices] = useState<string[]>([]);

  const toggleService = (s: string) =>
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  async function finishDriver() {
    setLoading(true);
    try {
      // Save profile details
      await fetch("/api/driver/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name, phone }),
      });

      // Add first vehicle if provided
      if (!skipVehicle && make && model && year) {
        await fetch("/api/garage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ make, model, year: Number(year), colour: colour || undefined }),
        });
      }
    } catch {
      // Non-fatal — proceed anyway
    }
    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="max-w-md w-full text-center mx-auto">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-fire/20">
          <Check className="h-10 w-10 text-fire" />
        </div>
        <h1 className="text-3xl font-bold mb-3">You&apos;re all set, {name || "there"}!</h1>
        <p className="text-slate-400 leading-7 mb-4">
          {skipVehicle
            ? "Your account is ready. Add your car in My Garage whenever you're ready."
            : `Your ${year} ${make} ${model} has been added to My Garage.`}{" "}
          Find a mechanic, get quotes, and track your car&apos;s history all in one place.
        </p>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fire/30 bg-fire/10 px-4 py-2 text-sm font-semibold text-fire">
          🎉 You earned 50 XP for completing your profile!
        </div>
        <p className="mb-8 text-sm text-slate-400">
          You&apos;re starting as a <span className="font-semibold text-white">Rookie</span>. Complete more actions to level up!
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/mechanics"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-fire px-8 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
          >
            Find a mechanic <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/garage"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            Go to My Garage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg w-full mx-auto">
      <StepBar current={step} total={3} />

      {/* Step 1: Personal details */}
      {step === 1 && (
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-fire/10 px-3 py-1.5 text-xs font-semibold text-fire">
            <MapPin className="h-3.5 w-3.5" /> Your details
          </div>
          <h1 className="text-3xl font-bold mb-2">Let&apos;s set up your account</h1>
          <p className="text-slate-400 mb-8">Quick details so we can connect you with the right mechanics near you.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kagiso Sithole"
                className={inputCls}
                autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone number <span className="text-slate-600">(optional)</span></label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 072 123 4567"
                className={inputCls}
                autoComplete="tel"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Your city <span className="text-slate-500 font-normal">— used to find mechanics near you</span>
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputCls}
              >
                <option value="">Select your city…</option>
                {SA_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!city}
              className="rounded-full bg-fire px-8 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: First vehicle */}
      {step === 2 && (
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-fire/10 px-3 py-1.5 text-xs font-semibold text-fire">
            <Car className="h-3.5 w-3.5" /> Your car
          </div>
          <h1 className="text-3xl font-bold mb-2">Add your first vehicle</h1>
          <p className="text-slate-400 mb-8">
            Your car details help workshops give you accurate quotes and lets you track service history.
          </p>

          {!skipVehicle ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Make</label>
                  <select
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select make…</option>
                    {CAR_MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Year…</option>
                    {YEARS.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Polo, Hilux, Swift, Ranger…"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Colour <span className="text-slate-600">(optional)</span></label>
                <input
                  type="text"
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  placeholder="e.g. Silver"
                  className={inputCls}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 px-6 py-10 text-center text-slate-500">
              <Car className="h-8 w-8 mx-auto mb-3 text-slate-600" />
              You can add your car later from My Garage.
            </div>
          )}

          <button
            type="button"
            onClick={() => setSkipVehicle((v) => !v)}
            className="mt-4 text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition"
          >
            {skipVehicle ? "← Add a vehicle instead" : "Skip — I'll add my car later"}
          </button>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-white/20"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!skipVehicle && (!make || !model || !year)}
              className="rounded-full bg-fire px-8 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Services they need */}
      {step === 3 && (
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-fire/10 px-3 py-1.5 text-xs font-semibold text-fire">
            <Wrench className="h-3.5 w-3.5" /> Your needs
          </div>
          <h1 className="text-3xl font-bold mb-2">What do you usually need?</h1>
          <p className="text-slate-400 mb-8">
            Select what you typically get done. We&apos;ll use this to match you with the right workshops. You can skip this if you&apos;re not sure.
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DRIVER_SERVICES.map((s) => {
              const selected = services.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleService(s)}
                  className={`rounded-2xl border px-3 py-3 text-sm font-medium text-left transition ${
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
              onClick={() => setStep(2)}
              className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-white/20"
            >
              ← Back
            </button>
            <button
              onClick={finishDriver}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-fire px-8 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Setting up…" : "Finish setup →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Workshop onboarding ──────────────────────────────────────────────────────

const WS_SERVICES = [
  "Car Repair", "Tyres", "Panel & Paint", "Diagnostics",
  "Brakes", "Suspension", "Transmission", "General Service",
  "Aircon", "Electrical", "Clutch & Gearbox", "Roadworthy",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
type HoursEntry = { open: string; close: string; enabled: boolean };
type Hours = Record<string, HoursEntry>;

function defaultHours(): Hours {
  const h: Hours = {};
  for (const d of DAYS) h[d] = { open: "08:00", close: "17:00", enabled: true };
  h["Sunday"] = { open: "09:00", close: "13:00", enabled: false };
  return h;
}

function WorkshopOnboarding({ userName }: { userName: string }) {
  const firstName = userName.split(" ")[0];
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  const [name, setName] = useState(firstName);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [hours, setHours] = useState<Hours>(defaultHours());

  const toggleService = (s: string) =>
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  function updateHour(day: string, field: "open" | "close" | "enabled", value: string | boolean) {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  }

  async function finish() {
    try {
      await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, addressLine1: address, listingTypes: services, openingHours: hours }),
      });
    } catch { /* Proceed regardless */ }
    setDone(true);
  }

  if (done) {
    return (
      <div className="max-w-md w-full text-center mx-auto">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-fire/20">
          <Check className="h-10 w-10 text-fire" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Workshop setup complete!</h1>
        <p className="text-slate-400 mb-8">Your workshop is live. Head to your dashboard to manage leads and update your profile.</p>
        <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-fire px-8 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90">
          Go to dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full mx-auto">
      <StepBar current={step} total={3} />

      {step === 1 && (
        <div>
          <h1 className="text-3xl font-bold mb-2">Basic info</h1>
          <p className="text-slate-400 mb-8">Tell us about your workshop so drivers can find you.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Workshop name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cape Auto Repairs" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 021 555 1234" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 12 Main Road, Cape Town" className={inputCls} />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button onClick={() => setStep(2)} disabled={!name} className="rounded-full bg-fire px-8 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40 disabled:cursor-not-allowed">Next →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="text-3xl font-bold mb-2">Services offered</h1>
          <p className="text-slate-400 mb-8">Select all services your workshop provides.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {WS_SERVICES.map((s) => {
              const selected = services.includes(s);
              return (
                <button key={s} onClick={() => toggleService(s)} className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${selected ? "border-fire bg-fire/10 text-fire" : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"}`}>
                  {selected && <Check className="inline h-3.5 w-3.5 mr-1.5" />}{s}
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex justify-between">
            <button onClick={() => setStep(1)} className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-white/20">← Back</button>
            <button onClick={() => setStep(3)} className="rounded-full bg-fire px-8 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90">Next →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 className="text-3xl font-bold mb-2">Opening hours</h1>
          <p className="text-slate-400 mb-8">Set your regular trading hours.</p>
          <div className="space-y-3">
            {[...DAYS, "Sunday"].map((day) => {
              const h = hours[day];
              return (
                <div key={day} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <input type="checkbox" checked={h.enabled} onChange={(e) => updateHour(day, "enabled", e.target.checked)} className="accent-fire h-4 w-4 shrink-0" />
                  <span className="w-24 text-sm font-medium text-slate-300 shrink-0">{day}</span>
                  {h.enabled ? (
                    <div className="flex items-center gap-2 ml-auto">
                      <input type="time" value={h.open} onChange={(e) => updateHour(day, "open", e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:border-fire focus:outline-none" />
                      <span className="text-slate-500 text-xs">to</span>
                      <input type="time" value={h.close} onChange={(e) => updateHour(day, "close", e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:border-fire focus:outline-none" />
                    </div>
                  ) : (
                    <span className="ml-auto text-xs text-slate-500">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex justify-between">
            <button onClick={() => setStep(2)} className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-white/20">← Back</button>
            <button onClick={finish} className="rounded-full bg-fire px-8 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90">Complete setup</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-fire animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const userName = session.user?.name ?? session.user?.email ?? "there";
  const role = (session.user as typeof session.user & { role?: string }).role ?? "DRIVER";
  const isWorkshop = role === "WORKSHOP_OWNER";

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col items-center justify-center px-4 py-16">
      {isWorkshop ? (
        <WorkshopOnboarding userName={userName} />
      ) : (
        <DriverOnboarding userName={userName} />
      )}
    </div>
  );
}
