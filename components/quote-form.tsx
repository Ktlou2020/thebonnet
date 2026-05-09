"use client";

import { FormEvent, useState } from "react";

const initialState = {
  fullName: "",
  phone: "",
  email: "",
  location: "",
  vehicle: "",
  serviceNeeded: "",
  urgency: "This week",
  details: ""
};

export function QuoteForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setStatus(payload.message ?? "Lead captured successfully.");
      setForm(initialState);
    } catch {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
        <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" required />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="WhatsApp / phone" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" required />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" required />
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City / suburb" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" required />
        <input value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} placeholder="Vehicle make / model / year" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" required />
        <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent">
          <option>Today</option>
          <option>This week</option>
          <option>Flexible</option>
        </select>
      </div>
      <input value={form.serviceNeeded} onChange={(e) => setForm({ ...form, serviceNeeded: e.target.value })} placeholder="Service needed / issue" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" required />
      <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Describe the problem, symptoms, or upload flow you would add later" rows={5} className="rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">This demo posts to an API route and returns a mocked lead confirmation for the GitHub starter.</p>
        <button type="submit" disabled={loading} className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-bonnet disabled:opacity-60">
          {loading ? "Capturing lead..." : "Submit lead"}
        </button>
      </div>
      {status ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{status}</div> : null}
    </form>
  );
}
