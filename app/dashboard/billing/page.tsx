"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type BillingData = {
  plan: string;
  renewsAt: string | null;
};

const TIERS = [
  {
    name: "FREE",
    label: "Free",
    features: ["Basic listing", "Public profile"],
    price: "R0/mo",
  },
  {
    name: "GROWTH",
    label: "Growth",
    features: ["Featured listing", "Lead notifications", "Analytics dashboard"],
    price: "R499/mo",
  },
  {
    name: "PRO",
    label: "Pro",
    features: ["Everything in Growth", "Priority placement", "Verified badge", "Response time tracking"],
    price: "R999/mo",
  },
  {
    name: "PLUS",
    label: "Plus",
    features: ["Everything in Pro", "Emergency dispatch", "Dedicated support", "API access"],
    price: "R1,999/mo",
  },
];

const TIER_ORDER = ["FREE", "GROWTH", "PRO", "PLUS"];

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/billing")
      .then((r) => r.json() as Promise<BillingData>)
      .then(setBilling)
      .catch(() => setError("Failed to load billing info."))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade(tier: string) {
    setUpgrading(tier);
    try {
      const res = await fetch("/api/billing/workshop/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Failed to start upgrade.");
      }
    } catch {
      setError("Failed to start upgrade.");
    } finally {
      setUpgrading(null);
    }
  }

  const currentTierIndex = billing ? TIER_ORDER.indexOf(billing.plan) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ink text-white px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-300 hover:text-white text-sm">
              ← Dashboard
            </Link>
          </div>
          <h1 className="mt-4 text-3xl font-bold">Billing &amp; Subscription</h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
        {loading && <p className="text-slate-500 text-sm">Loading billing info…</p>}
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {billing && (
          <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Current plan</p>
            <h2 className="text-2xl font-bold text-fire">
              {TIERS.find((t) => t.name === billing.plan)?.label ?? billing.plan}
            </h2>
            {billing.renewsAt && (
              <p className="mt-2 text-sm text-slate-500">
                Renews on{" "}
                <span className="font-semibold text-slate-700">
                  {new Date(billing.renewsAt).toLocaleDateString("en-ZA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
            )}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier, i) => {
            const isCurrent = billing?.plan === tier.name;
            const isUpgrade = i > currentTierIndex;

            return (
              <div
                key={tier.name}
                className={`rounded-[2rem] p-6 border transition ${
                  isCurrent
                    ? "border-fire bg-fire/5"
                    : "border-slate-200 bg-white shadow-soft"
                }`}
              >
                <h3 className="text-lg font-bold text-slate-900">{tier.label}</h3>
                <p className="mt-1 text-xl font-semibold text-fire">{tier.price}</p>
                <ul className="mt-4 space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fire" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent && (
                  <span className="mt-5 block text-center rounded-full bg-fire/10 px-4 py-2 text-xs font-semibold text-fire">
                    Current plan
                  </span>
                )}
                {isUpgrade && (
                  <button
                    onClick={() => handleUpgrade(tier.name)}
                    disabled={upgrading === tier.name}
                    className="mt-5 block w-full rounded-full bg-fire px-4 py-2 text-center text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-50"
                  >
                    {upgrading === tier.name ? "Redirecting…" : `Upgrade to ${tier.label}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
