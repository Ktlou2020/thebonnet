"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

const ROLES = ["Owner", "Manager", "Employee"] as const;

export default function ClaimWorkshopPage() {
  const { data: session } = useSession();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [form, setForm] = useState({
    fullName: "",
    email: session?.user?.email ?? "",
    phone: "",
    role: "Owner" as (typeof ROLES)[number],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.email && !form.email) {
      setForm((prev) => ({ ...prev, email: session.user!.email! }));
    }
  }, [session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/claim/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center rounded-[2rem] border border-slate-200 bg-white p-10 shadow-soft">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-slate-900">Request received!</h1>
          <p className="mt-3 text-slate-500 text-sm leading-7">
            Thanks! We&apos;ll verify your ownership and get back to you within 24 hours.
          </p>
          <a href={`/mechanics/${slug}`} className="mt-6 inline-block rounded-full bg-fire text-white font-semibold px-6 py-2.5 text-sm hover:bg-fire/90 transition">
            Back to workshop
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <h1 className="text-2xl font-bold text-slate-900">Claim this workshop</h1>
          <p className="mt-2 text-sm text-slate-500">Verify you own this business to manage your listing on The Bonnet.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full name</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-fire focus:outline-none focus:ring-1 focus:ring-fire"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-fire focus:outline-none focus:ring-1 focus:ring-fire"
                placeholder="jane@workshop.co.za"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone number</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-fire focus:outline-none focus:ring-1 focus:ring-fire"
                placeholder="+27 81 234 5678"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your role at this business</label>
              <select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as (typeof ROLES)[number] }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-fire focus:outline-none focus:ring-1 focus:ring-fire"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-fire py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Submit claim request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
