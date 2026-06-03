"use client";

import { useState } from "react";

export function DriverProfileTab({
  email,
  fullName,
  phone,
  referralCode,
}: {
  email: string;
  fullName: string | null;
  phone: string | null;
  referralCode: string | null;
}) {
  const [form, setForm] = useState({ fullName: fullName ?? "", phone: phone ?? "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const referralLink = referralCode
    ? `https://thebonnet.co.za/signup?ref=${referralCode}`
    : null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    const res = await fetch("/api/driver/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
    } else {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Failed to save.");
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Profile</h2>
      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
          <p className="text-sm text-slate-700">{email}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Full name</label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
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

        {referralLink && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Referral link</label>
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-700 font-mono break-all">{referralLink}</p>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(referralLink)}
                className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-fire hover:text-fire"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {saved && <p className="text-sm text-emerald-600 font-medium">✓ Profile saved.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-fire px-6 py-3 text-sm font-semibold text-white shadow-glow-fire hover:bg-fire/90 disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
