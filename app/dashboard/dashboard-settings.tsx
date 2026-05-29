"use client";

import { useState } from "react";

type WorkshopData = {
  id: string;
  name: string;
  slug: string;
  city: string;
  phone: string | null;
  description: string;
};

export function DashboardSettings({ workshop }: { workshop: WorkshopData }) {
  const [form, setForm] = useState({
    name: workshop.name,
    phone: workshop.phone ?? "",
    city: workshop.city,
    description: workshop.description,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const res = await fetch("/api/dashboard/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workshopId: workshop.id, ...form }),
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
