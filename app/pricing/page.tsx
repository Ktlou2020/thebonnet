import { subscriptionPlans } from "@/lib/workshops";
import { CheckCircle } from "lucide-react";
import { WorkshopUpgradeButton } from "./workshop-upgrade-button";

export const metadata = {
  title: "Pricing | My Bonnet",
  description: "Simple, transparent pricing for drivers and workshops on My Bonnet marketplace.",
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; upgraded?: string }>;
}) {
  const params = await searchParams;
  const upgraded = params?.upgraded === "true";
  const paymentError = params?.error;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-ink text-white px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fire mb-3">Pricing</p>
          <h1 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            My Bonnet is always free for drivers. Workshop plans are designed to help you grow your customer base.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        {upgraded && (
          <div className="mb-8 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="font-bold text-emerald-800 text-lg">🎉 Welcome to Bonnet Plus!</p>
            <p className="text-sm text-emerald-600 mt-1">Your upgrade was successful. Enjoy unlimited access.</p>
          </div>
        )}

        {paymentError && (
          <div className="mb-8 rounded-[2rem] border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-800">Payment failed. Please try again or contact support.</p>
          </div>
        )}

        {/* For Workshops */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-8">For workshops</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[2rem] p-8 shadow-soft ${
                  plan.highlighted
                    ? "border-2 border-fire bg-white shadow-glow-fire"
                    : "border border-slate-200 bg-white"
                }`}
              >
                {plan.highlighted && (
                  <span className="inline-block rounded-full bg-fire px-3 py-0.5 text-xs font-bold text-white mb-4">
                    Recommended
                  </span>
                )}
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                  {plan.period && <span className="text-slate-500">/{plan.period}</span>}
                </div>
                <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-fire" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {plan.name === "Growth" ? (
                    <WorkshopUpgradeButton plan="GROWTH" label={plan.cta} />
                  ) : plan.name === "Pro" ? (
                    <WorkshopUpgradeButton plan="PRO" label={plan.cta} />
                  ) : (
                    <a
                      href="/for-mechanics"
                      className="block w-full rounded-full border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                    >
                      {plan.cta}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
