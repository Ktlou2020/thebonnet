"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Check, Gift, LogIn } from "lucide-react";

export function RecommendForm({ cities }: { cities: string[] }) {
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ name: "", city: "", province: "", phone: "", website: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await res.json().catch(() => ({}));
      setDone(payload.message ?? "Thanks for your recommendation!");
    } catch {
      setDone("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fire";

  if (status === "loading") {
    return <div className="h-40 rounded-[2rem] border border-slate-200 bg-white animate-pulse" />;
  }

  if (!session) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-soft">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fire/10 text-fire">
          <LogIn className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-xl font-bold text-slate-900">Sign in to recommend a workshop</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-500">
          Create a free account to nominate workshops and earn <strong>150 XP</strong> for every recommendation that gets verified.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/login?callbackUrl=/recommend" className="inline-flex items-center gap-2 rounded-full bg-fire px-6 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90">
            <LogIn className="h-4 w-4" /> Sign in to continue
          </Link>
          <Link href="/mechanics" className="inline-flex items-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
            Browse mechanics
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-soft">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent"><Check className="h-8 w-8" /></div>
        <h2 className="mt-5 text-2xl font-bold text-slate-950">Recommendation received</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">{done}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <div className="inline-flex items-center gap-2 rounded-full bg-fire/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-fire">
        <Gift className="h-3.5 w-3.5" /> Earn 150 XP
      </div>
      <label className="text-sm font-medium text-slate-700">Workshop name *
        <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Joe's Auto Repairs" className={`mt-1 ${inputCls}`} required />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">City *
          <select value={form.city} onChange={(e) => set("city", e.target.value)} className={`mt-1 ${inputCls}`} required>
            <option value="">Select city</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Province
          <input value={form.province} onChange={(e) => set("province", e.target.value)} placeholder="e.g. Western Cape" className={`mt-1 ${inputCls}`} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Phone
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0xx xxx xxxx" className={`mt-1 ${inputCls}`} />
        </label>
        <label className="text-sm font-medium text-slate-700">Website
          <input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" className={`mt-1 ${inputCls}`} />
        </label>
      </div>
      <label className="text-sm font-medium text-slate-700">Why do you recommend them?
        <textarea value={form.note} onChange={(e) => set("note", e.target.value)} rows={3} placeholder="Great service, fair prices…" className={`mt-1 ${inputCls} resize-none`} />
      </label>
      <button type="submit" disabled={loading || !form.name || !form.city} className="rounded-full bg-fire px-6 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40">
        {loading ? "Submitting…" : "Submit recommendation"}
      </button>
    </form>
  );
}
