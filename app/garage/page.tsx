"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Wrench, Plus, X, ChevronDown, ChevronUp, AlertTriangle, Bell } from "lucide-react";
import type { GarageVehicle, GarageServiceRecord } from "@/lib/types";
import { useSession } from "next-auth/react";

const REMINDER_TYPES = ["Oil Change", "Major Service", "Tyre Rotation", "Brakes", "Custom"];

type MaintenanceReminder = {
  id: string;
  vehicleId: string;
  reminderType: string;
  dueDate: string;
  dueMileage?: number | null;
};

// ── XP config ────────────────────────────────────────────────────────────────
const XP_THRESHOLDS = [0, 200, 500, 1000, 2000];
const LEVEL_NAMES = ["Novice Driver", "Regular Driver", "Savvy Driver", "Car Enthusiast", "Bonnet Pro"];

interface UserXP {
  totalXp: number;
  level: number;
  badges: string[];
  streakDays: number;
}

function calcLevel(xp: number): number {
  let l = 0;
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) l = i;
  }
  return l;
}

function getProgress(xp: number): { current: number; next: number; pct: number } {
  const level = calcLevel(xp);
  const current = XP_THRESHOLDS[level];
  const next = XP_THRESHOLDS[level + 1] ?? current + 1000;
  const pct = Math.min(100, ((xp - current) / (next - current)) * 100);
  return { current, next, pct };
}

// ── Storage keys ─────────────────────────────────────────────────────────────
const VEHICLES_KEY = "bonnet_vehicles";
const RECORDS_KEY = "bonnet_service_records";
const XP_KEY = "bonnet_xp";

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Service types ─────────────────────────────────────────────────────────────
const SERVICE_TYPES = [
  "Oil & Filter Change", "Major Service", "Minor Service", "Brake Service",
  "Tyre Replacement", "Suspension", "Electrical", "Aircon Service",
  "Clutch", "Transmission", "Engine Work", "Body & Paint", "Other",
];

const MAKES = [
  "Toyota", "Volkswagen", "Ford", "Hyundai", "Suzuki", "Kia", "Renault",
  "BMW", "Mercedes-Benz", "Audi", "Nissan", "Isuzu", "Haval", "Chery", "GWM", "Other",
];

const YEARS = Array.from({ length: 36 }, (_, i) => 2025 - i);

// ── Health indicator ───────────────────────────────────────────────────────────
function healthColour(lastServiceDate: string | undefined): string {
  if (!lastServiceDate) return "bg-red-400";
  const months = (Date.now() - new Date(lastServiceDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (months < 6) return "bg-green-400";
  if (months < 12) return "bg-amber-400";
  return "bg-red-400";
}

// ── Colour dot preview ────────────────────────────────────────────────────────
const COLOURS: { label: string; hex: string }[] = [
  { label: "White", hex: "#f8fafc" }, { label: "Silver", hex: "#94a3b8" },
  { label: "Grey", hex: "#64748b" }, { label: "Black", hex: "#0f172a" },
  { label: "Red", hex: "#ef4444" }, { label: "Blue", hex: "#3b82f6" },
  { label: "Green", hex: "#22c55e" }, { label: "Yellow", hex: "#eab308" },
  { label: "Orange", hex: "#f97316" }, { label: "Brown", hex: "#78350f" },
];

// ── uuid-lite ─────────────────────────────────────────────────────────────────
function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function GaragePage() {
  const { data: session } = useSession();
  const [syncDismissed, setSyncDismissed] = useState(false);
  const [synced, setSynced] = useState(false);

  const [vehicles, setVehicles] = useState<GarageVehicle[]>([]);
  const [records, setRecords] = useState<GarageServiceRecord[]>([]);
  const [xp, setXp] = useState<UserXP>({ totalXp: 0, level: 0, badges: [], streakDays: 0 });
  const [loaded, setLoaded] = useState(false);
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [showReminderForm, setShowReminderForm] = useState<string | null>(null);
  const [reminderForm, setReminderForm] = useState({ reminderType: "", dueDate: "", dueMileage: "" });

  async function handleSync() {
    const rawVehicles = localStorage.getItem("bonnet_vehicles");
    const rawRecords = localStorage.getItem("bonnet_service_records");
    const vehiclesToSync = rawVehicles ? JSON.parse(rawVehicles) : [];
    const recordsToSync = rawRecords ? JSON.parse(rawRecords) : [];

    await fetch("/api/garage/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicles: vehiclesToSync, serviceRecords: recordsToSync }),
    });

    localStorage.removeItem("bonnet_vehicles");
    localStorage.removeItem("bonnet_service_records");
    localStorage.removeItem("bonnet_xp");
    setSynced(true);
  }

  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null);
  const [showAddRecord, setShowAddRecord] = useState<string | null>(null);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  // ── Load vehicles: from API when logged in, otherwise localStorage ──
  useEffect(() => {
    if (session) {
      fetch("/api/garage")
        .then((r) => r.json())
        .then((data: { vehicles?: GarageVehicle[] }) => {
          if (data.vehicles) setVehicles(data.vehicles);
        })
        .catch(() => {
          setVehicles(loadJSON<GarageVehicle[]>(VEHICLES_KEY, []));
        })
        .finally(() => setLoaded(true));
    } else {
      setVehicles(loadJSON<GarageVehicle[]>(VEHICLES_KEY, []));
      setLoaded(true);
    }
    setRecords(loadJSON<GarageServiceRecord[]>(RECORDS_KEY, []));
    setXp(loadJSON<UserXP>(XP_KEY, { totalXp: 0, level: 0, badges: [], streakDays: 0 }));
  }, [session]);

  // ── Load reminders if authenticated ──
  useEffect(() => {
    if (session) {
      fetch("/api/reminders")
        .then((r) => r.json())
        .then((data: { reminders: MaintenanceReminder[] }) => setReminders(data.reminders ?? []))
        .catch(() => null);
    }
  }, [session]);

  async function submitReminder(vehicleId: string) {
    if (!reminderForm.reminderType || !reminderForm.dueDate) return;
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId,
        reminderType: reminderForm.reminderType,
        dueDate: reminderForm.dueDate,
        dueMileage: reminderForm.dueMileage ? parseInt(reminderForm.dueMileage) : undefined,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { reminder: MaintenanceReminder };
      setReminders((prev) => [...prev, data.reminder]);
      setShowReminderForm(null);
      setReminderForm({ reminderType: "", dueDate: "", dueMileage: "" });
    }
  }

  // ── XP helpers ──
  function addXP(amount: number, badge?: string) {
    setXp((prev) => {
      const totalXp = prev.totalXp + amount;
      const level = calcLevel(totalXp);
      const badges = badge && !prev.badges.includes(badge)
        ? [...prev.badges, badge]
        : prev.badges;
      const next = { ...prev, totalXp, level, badges };
      saveJSON(XP_KEY, next);
      return next;
    });
  }

  // ── Add vehicle ──
  const [vehicleForm, setVehicleForm] = useState({
    make: "", model: "", year: "", variant: "", colour: "", nickname: "", registrationNo: "", currentMileage: "",
  });

  async function submitVehicle() {
    if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.year) return;

    const isFirst = vehicles.length === 0;

    if (session) {
      // Persist to API when logged in
      try {
        const res = await fetch("/api/garage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            make: vehicleForm.make,
            model: vehicleForm.model,
            year: parseInt(vehicleForm.year),
            variant: vehicleForm.variant || undefined,
            colour: vehicleForm.colour || undefined,
            nickname: vehicleForm.nickname || undefined,
            registrationNo: vehicleForm.registrationNo || undefined,
            currentMileage: vehicleForm.currentMileage ? parseInt(vehicleForm.currentMileage) : undefined,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { vehicle: GarageVehicle };
          setVehicles((prev) => [...prev, data.vehicle]);
          addXP(isFirst ? 100 : 50, isFirst ? "First Ride 🚗" : undefined);
          if (vehicles.length + 1 >= 3) addXP(0, "Multi-Fleet 🏎️");
        }
      } catch {
        // Fall back to local on error
      }
    } else {
      const v: GarageVehicle = {
        id: uuid(),
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: parseInt(vehicleForm.year),
        variant: vehicleForm.variant || undefined,
        colour: vehicleForm.colour || undefined,
        nickname: vehicleForm.nickname || undefined,
        registrationNo: vehicleForm.registrationNo || undefined,
        currentMileage: vehicleForm.currentMileage ? parseInt(vehicleForm.currentMileage) : undefined,
        createdAt: new Date().toISOString(),
      };
      const next = [...vehicles, v];
      setVehicles(next);
      saveJSON(VEHICLES_KEY, next);
      addXP(isFirst ? 100 : 50, isFirst ? "First Ride 🚗" : undefined);
      if (next.length >= 3) addXP(0, "Multi-Fleet 🏎️");
    }

    setVehicleForm({ make: "", model: "", year: "", variant: "", colour: "", nickname: "", registrationNo: "", currentMileage: "" });
    setShowAddVehicle(false);
  }

  // ── Add service record ──
  const [recordForm, setRecordForm] = useState({
    serviceType: "", date: "", workshopName: "", city: "", mileageAtService: "", labourCents: "", partsCents: "", notes: "",
  });

  function submitRecord(vehicleId: string) {
    if (!recordForm.serviceType || !recordForm.date) return;
    const labour = recordForm.labourCents ? Math.round(parseFloat(recordForm.labourCents) * 100) : undefined;
    const parts = recordForm.partsCents ? Math.round(parseFloat(recordForm.partsCents) * 100) : undefined;
    const total = labour !== undefined && parts !== undefined ? labour + parts : labour ?? parts;
    const r: GarageServiceRecord = {
      id: uuid(),
      vehicleId,
      serviceType: recordForm.serviceType,
      date: recordForm.date,
      workshopName: recordForm.workshopName || undefined,
      city: recordForm.city || undefined,
      mileageAtService: recordForm.mileageAtService ? parseInt(recordForm.mileageAtService) : undefined,
      labourCents: labour,
      partsCents: parts,
      totalCostCents: total,
      notes: recordForm.notes || undefined,
      createdAt: new Date().toISOString(),
    };
    const next = [...records, r];
    setRecords(next);
    saveJSON(RECORDS_KEY, next);

    const isFirst = records.filter((rec) => rec.vehicleId === vehicleId).length === 0;
    addXP(isFirst ? 75 : 30, isFirst ? "Service Star 🔧" : undefined);

    setRecordForm({ serviceType: "", date: "", workshopName: "", city: "", mileageAtService: "", labourCents: "", partsCents: "", notes: "" });
    setShowAddRecord(null);
  }

  // ── Derived ──
  function vehicleRecords(vehicleId: string) {
    return records.filter((r) => r.vehicleId === vehicleId).sort((a, b) => b.date.localeCompare(a.date));
  }

  function totalSpend(vehicleId: string) {
    return vehicleRecords(vehicleId).reduce((sum, r) => sum + (r.totalCostCents ?? 0), 0) / 100;
  }

  function lastService(vehicleId: string) {
    const recs = vehicleRecords(vehicleId);
    return recs[0]?.date;
  }

  const progress = getProgress(xp.totalXp);

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-ink text-white px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold">My Garage</h1>
              <p className="mt-1 text-slate-300 text-sm">Track your vehicles, services, and maintenance history.</p>
            </div>
            {vehicles.length > 0 && (
              <button
                onClick={() => setShowAddVehicle(true)}
                className="inline-flex items-center gap-2 rounded-full bg-fire px-5 py-2.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
              >
                <Plus className="h-4 w-4" /> Add vehicle
              </button>
            )}
          </div>

          {/* XP bar */}
          {vehicles.length > 0 && (
            <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold text-white">{LEVEL_NAMES[xp.level]} • Level {xp.level + 1}</span>
                <span className="text-slate-400">{xp.totalXp} XP</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-fire transition-all"
                  style={{ width: `${progress.pct}%` }}
                />
              </div>
              {xp.badges.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {xp.badges.map((b) => (
                    <span key={b} className="rounded-full bg-fire/20 px-3 py-1 text-xs font-medium text-fire">{b}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        {/* Sync banner — only for logged-out users with local vehicles */}
        {!session && !syncDismissed && !synced && vehicles.length > 0 && (
          <div className="mb-4 rounded-2xl border border-fire/20 bg-fire/5 p-4 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-white">Your garage is saved locally. <strong>Sign in to sync to your account</strong> and access it on any device.</p>
            <div className="flex gap-2 shrink-0">
              <button onClick={handleSync} className="rounded-full bg-fire px-4 py-2 text-xs font-semibold text-white shadow-glow-fire">Sync now</button>
              <button onClick={() => setSyncDismissed(true)} className="rounded-full border border-white/20 px-3 py-2 text-xs text-white/70">Dismiss</button>
            </div>
          </div>
        )}
        {synced && (
          <div className="mb-4 rounded-2xl border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-400">
            ✓ Garage synced to your account successfully.
          </div>
        )}

        {/* Bonnet Plus upsell banner */}
        {!dismissedBanner && vehicles.length > 0 && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-[2rem] border border-fire/20 bg-fire/5 px-6 py-4">
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-fire">Bonnet Plus — R49/month.</span>{" "}
              Unlimited vehicles, AI diagnoses, priority quotes, and maintenance reminders.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/for-mechanics" className="rounded-full bg-fire px-4 py-2 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90">
                Upgrade
              </Link>
              <button onClick={() => setDismissedBanner(true)} className="rounded-full p-1.5 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {vehicles.length === 0 && !showAddVehicle && !session && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-2xl font-bold text-slate-900">Your garage is empty</h2>
            <p className="text-slate-500 mt-2 mb-6">Add your first vehicle to track services, costs and get personalised quotes.</p>
            <button
              onClick={() => setShowAddVehicle(true)}
              className="bg-fire text-white rounded-full px-8 py-3 font-semibold"
            >
              Add your first vehicle
            </button>
          </div>
        )}
        {vehicles.length === 0 && !showAddVehicle && session && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-2xl font-bold text-slate-900">Your garage is empty</h2>
            <p className="text-slate-500 mt-2 mb-6">Add your first vehicle to track services, costs and get personalised quotes. Your vehicles will sync automatically across devices.</p>
            <button
              onClick={() => setShowAddVehicle(true)}
              className="bg-fire text-white rounded-full px-8 py-3 font-semibold"
            >
              Add your first vehicle
            </button>
          </div>
        )}

        {/* Vehicle grid */}
        {vehicles.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((v) => {
              const lastSvc = lastService(v.id);
              const spend = totalSpend(v.id);
              const expanded = expandedVehicle === v.id;
              const vRecords = vehicleRecords(v.id);
              const colourHex = COLOURS.find((c) => c.label === v.colour)?.hex;

              return (
                <div key={v.id} className="rounded-[2rem] bg-white shadow-soft overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-400 font-medium">
                          {v.year} {v.make}
                        </p>
                        <h3 className="text-xl font-bold text-slate-900">{v.model}</h3>
                        {v.nickname && (
                          <p className="text-sm text-fire font-medium mt-0.5">&quot;{v.nickname}&quot;</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {colourHex && (
                          <span
                            className="h-5 w-5 rounded-full border border-slate-200"
                            style={{ backgroundColor: colourHex }}
                            title={v.colour}
                          />
                        )}
                        <span className={`h-3 w-3 rounded-full ${healthColour(lastSvc)}`} title="Service health" />
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-slate-400 text-xs mb-1">Last service</p>
                        <p className="font-semibold text-slate-900">
                          {lastSvc ? new Date(lastSvc).toLocaleDateString("en-ZA", { month: "short", year: "numeric" }) : "Not recorded"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-slate-400 text-xs mb-1">Total spend</p>
                        <p className="font-semibold text-slate-900">
                          {spend > 0 ? `R${spend.toLocaleString()}` : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setShowAddRecord(v.id)}
                        className="flex-1 rounded-full border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition hover:border-fire hover:text-fire"
                      >
                        + Add service
                      </button>
                      <button
                        onClick={() => setExpandedVehicle(expanded ? null : v.id)}
                        className="rounded-full border border-slate-200 px-3 py-2 text-slate-500 transition hover:border-fire hover:text-fire"
                      >
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Service history */}
                  {expanded && (
                    <div className="border-t border-slate-100 px-6 pb-6 pt-4">
                      {/* Maintenance reminders */}
                      {session && (
                        <div className="mb-5">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-slate-900">Reminders</h4>
                            <button
                              onClick={() => setShowReminderForm(showReminderForm === v.id ? null : v.id)}
                              className="text-xs font-semibold text-fire hover:underline"
                            >
                              {showReminderForm === v.id ? "Cancel" : "+ Set reminder"}
                            </button>
                          </div>
                          {/* Reminder chips */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {reminders.filter((r) => r.vehicleId === v.id).map((r) => (
                              <span key={r.id} className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-800">
                                <Bell className="h-3 w-3" />
                                {r.reminderType} due {new Date(r.dueDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            ))}
                            {reminders.filter((r) => r.vehicleId === v.id).length === 0 && (
                              <span className="text-xs text-slate-400">No reminders set.</span>
                            )}
                          </div>
                          {showReminderForm === v.id && (
                            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Reminder type</label>
                                <select
                                  value={reminderForm.reminderType}
                                  onChange={(e) => setReminderForm((f) => ({ ...f, reminderType: e.target.value }))}
                                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-fire focus:outline-none"
                                >
                                  <option value="">Select...</option>
                                  {REMINDER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">Due date</label>
                                  <input
                                    type="date"
                                    value={reminderForm.dueDate}
                                    onChange={(e) => setReminderForm((f) => ({ ...f, dueDate: e.target.value }))}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-fire focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">Mileage (km, optional)</label>
                                  <input
                                    type="number"
                                    value={reminderForm.dueMileage}
                                    onChange={(e) => setReminderForm((f) => ({ ...f, dueMileage: e.target.value }))}
                                    placeholder="km"
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-fire focus:outline-none"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => submitReminder(v.id)}
                                disabled={!reminderForm.reminderType || !reminderForm.dueDate}
                                className="rounded-full bg-fire px-4 py-2 text-xs font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40"
                              >
                                Save reminder
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">Service history</h4>
                      {vRecords.length === 0 ? (
                        <p className="text-sm text-slate-400">No services logged yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {vRecords.map((r) => (
                            <div key={r.id} className="flex items-start gap-3 text-sm">
                              <div className="mt-1 h-2 w-2 rounded-full bg-fire shrink-0" />
                              <div className="flex-1">
                                <div className="flex justify-between gap-2">
                                  <span className="font-medium text-slate-900">{r.serviceType}</span>
                                  <span className="text-slate-400 text-xs whitespace-nowrap">
                                    {new Date(r.date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                                  </span>
                                </div>
                                {r.workshopName && <p className="text-slate-500 text-xs mt-0.5">{r.workshopName}{r.city ? `, ${r.city}` : ""}</p>}
                                {r.totalCostCents && (
                                  <p className="text-fire text-xs font-semibold mt-0.5">R{(r.totalCostCents / 100).toLocaleString()}</p>
                                )}
                                {r.notes && <p className="text-slate-400 text-xs mt-0.5">{r.notes}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add vehicle modal */}
        {showAddVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Add vehicle</h2>
                <button onClick={() => setShowAddVehicle(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Make *</label>
                    <select
                      value={vehicleForm.make}
                      onChange={(e) => setVehicleForm((f) => ({ ...f, make: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-fire focus:outline-none"
                    >
                      <option value="">Select...</option>
                      {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Year *</label>
                    <select
                      value={vehicleForm.year}
                      onChange={(e) => setVehicleForm((f) => ({ ...f, year: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-fire focus:outline-none"
                    >
                      <option value="">Year...</option>
                      {YEARS.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                    </select>
                  </div>
                </div>
                {[
                  { field: "model" as const, label: "Model *", placeholder: "e.g. Polo, Hilux" },
                  { field: "variant" as const, label: "Variant", placeholder: "e.g. 1.4 Comfortline" },
                  { field: "nickname" as const, label: "Nickname", placeholder: "e.g. The Beast" },
                  { field: "registrationNo" as const, label: "Registration", placeholder: "e.g. CA 123 456" },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                    <input
                      type="text"
                      value={vehicleForm[field]}
                      onChange={(e) => setVehicleForm((f) => ({ ...f, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-fire focus:outline-none"
                    />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Colour</label>
                    <select
                      value={vehicleForm.colour}
                      onChange={(e) => setVehicleForm((f) => ({ ...f, colour: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-fire focus:outline-none"
                    >
                      <option value="">Colour...</option>
                      {COLOURS.map((c) => <option key={c.label} value={c.label}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Current mileage (km)</label>
                    <input
                      type="number"
                      value={vehicleForm.currentMileage}
                      onChange={(e) => setVehicleForm((f) => ({ ...f, currentMileage: e.target.value }))}
                      placeholder="km"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-fire focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowAddVehicle(false)}
                  className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={submitVehicle}
                  disabled={!vehicleForm.make || !vehicleForm.model || !vehicleForm.year}
                  className="flex-1 rounded-full bg-fire px-5 py-2.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add to garage
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add service record modal */}
        {showAddRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Add service record</h2>
                <button onClick={() => setShowAddRecord(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Service type *</label>
                  <select
                    value={recordForm.serviceType}
                    onChange={(e) => setRecordForm((f) => ({ ...f, serviceType: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-fire focus:outline-none"
                  >
                    <option value="">Select type...</option>
                    {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Date *</label>
                    <input
                      type="date"
                      value={recordForm.date}
                      onChange={(e) => setRecordForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-fire focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Mileage (km)</label>
                    <input
                      type="number"
                      value={recordForm.mileageAtService}
                      onChange={(e) => setRecordForm((f) => ({ ...f, mileageAtService: e.target.value }))}
                      placeholder="km"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-fire focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Workshop</label>
                    <input
                      type="text"
                      value={recordForm.workshopName}
                      onChange={(e) => setRecordForm((f) => ({ ...f, workshopName: e.target.value }))}
                      placeholder="Workshop name"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-fire focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
                    <input
                      type="text"
                      value={recordForm.city}
                      onChange={(e) => setRecordForm((f) => ({ ...f, city: e.target.value }))}
                      placeholder="City"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-fire focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Labour (R)</label>
                    <input
                      type="number"
                      value={recordForm.labourCents}
                      onChange={(e) => setRecordForm((f) => ({ ...f, labourCents: e.target.value }))}
                      placeholder="0.00"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-fire focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Parts (R)</label>
                    <input
                      type="number"
                      value={recordForm.partsCents}
                      onChange={(e) => setRecordForm((f) => ({ ...f, partsCents: e.target.value }))}
                      placeholder="0.00"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-fire focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                  <textarea
                    value={recordForm.notes}
                    onChange={(e) => setRecordForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    placeholder="Any additional notes..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-fire focus:outline-none resize-none"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowAddRecord(null)}
                  className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitRecord(showAddRecord)}
                  disabled={!recordForm.serviceType || !recordForm.date}
                  className="flex-1 rounded-full bg-fire px-5 py-2.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save record
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer — only shown for logged-out users */}
        {!session && vehicles.length > 0 && (
          <div className="mt-8 flex items-start gap-2 text-xs text-slate-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>Garage data is saved locally. Sign in to sync across devices.</span>
          </div>
        )}
      </div>
    </div>
  );
}
