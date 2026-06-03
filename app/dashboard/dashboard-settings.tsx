"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/image-upload";

type WorkshopData = {
  id: string;
  name: string;
  slug: string;
  city: string;
  phone: string | null;
  description: string;
  imageUrl?: string | null;
  openingHours?: unknown;
};

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

type DayKey = (typeof DAYS)[number]["key"];

type HoursRow = { open: boolean; from: string; to: string };
type HoursState = Record<DayKey, HoursRow>;

function parseInitialHours(raw: unknown): HoursState {
  const defaults: HoursState = {} as HoursState;
  for (const { key } of DAYS) {
    defaults[key] = { open: false, from: "08:00", to: "17:00" };
  }
  if (!raw || typeof raw !== "object") return defaults;
  const obj = raw as Record<string, string | null>;
  for (const { key } of DAYS) {
    const val = obj[key];
    if (val) {
      const [from, to] = val.split("-").map((s) => s.trim());
      defaults[key] = { open: true, from: from ?? "08:00", to: to ?? "17:00" };
    }
  }
  return defaults;
}

export function DashboardSettings({ workshop }: { workshop: WorkshopData }) {
  const [imageUrl, setImageUrl] = useState<string>(workshop.imageUrl ?? "");
  const [form, setForm] = useState({
    name: workshop.name,
    phone: workshop.phone ?? "",
    city: workshop.city,
    description: workshop.description,
  });
  const [hours, setHours] = useState<HoursState>(() =>
    parseInitialHours(workshop.openingHours)
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const openingHours: Record<string, string | null> = {};
    for (const { key } of DAYS) {
      const row = hours[key];
      openingHours[key] = row.open ? `${row.from}-${row.to}` : null;
    }

    const res = await fetch("/api/dashboard/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workshopId: workshop.id,
        ...form,
        imageUrl: imageUrl || undefined,
        openingHours,
      }),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
    } else {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Failed to save settings.");
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-lg space-y-5">
      <div>
        <ImageUpload
          label="Cover photo"
          folder="workshops"
          currentUrl={imageUrl}
          onUpload={(url) => setImageUrl(url)}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Workshop name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-fire focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-fire focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
        <input
          type="text"
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          required
          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-fire focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={4}
          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-fire focus:outline-none resize-none"
        />
      </div>

      {/* Opening hours editor */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-3">Opening hours</label>
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          {DAYS.map(({ key, label }) => {
            const row = hours[key];
            return (
              <div key={key} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  id={`open-${key}`}
                  checked={row.open}
                  onChange={(e) =>
                    setHours((h) => ({ ...h, [key]: { ...h[key], open: e.target.checked } }))
                  }
                  className="accent-fire"
                />
                <label htmlFor={`open-${key}`} className="w-24 text-slate-700 font-medium">
                  {label}
                </label>
                {row.open ? (
                  <>
                    <input
                      type="time"
                      value={row.from}
                      onChange={(e) =>
                        setHours((h) => ({ ...h, [key]: { ...h[key], from: e.target.value } }))
                      }
                      className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs focus:border-fire focus:outline-none"
                    />
                    <span className="text-slate-400">–</span>
                    <input
                      type="time"
                      value={row.to}
                      onChange={(e) =>
                        setHours((h) => ({ ...h, [key]: { ...h[key], to: e.target.value } }))
                      }
                      className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs focus:border-fire focus:outline-none"
                    />
                  </>
                ) : (
                  <span className="text-xs text-slate-400 italic">Closed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {saved && <p className="text-sm text-emerald-600 font-medium">✓ Settings saved.</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-fire px-6 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40"
      >
        {saving ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
