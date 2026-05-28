import Link from "next/link";
import { BadgeCheck, TrendingUp, Zap } from "lucide-react";
import { subscriptionPlans } from "@/lib/workshops";
import { SectionHeading } from "@/components/section-heading";

export default function ForMechanicsPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-ink text-white px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Workshop growth"
            title="A lead generation platform mechanics will actually pay for"
            description="The Bonnet is built around measurable workshop value: qualified leads, performance analytics, and city-level visibility that directly converts to booked jobs."
          />
        </div>
      </div>

      {/* Plan cards */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Choose your plan</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[2rem] p-8 shadow-soft transition ${
                plan.highlighted
                  ? "border-2 border-fire bg-white relative"
                  : "border border-slate-200 bg-white"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-fire px-4 py-1 text-xs font-bold text-white shadow-glow-fire">
                  Most popular
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                {plan.highlighted && <BadgeCheck className="h-6 w-6 text-fire" />}
              </div>
              <div className="flex items-baseline gap-1 mt-3 mb-1">
                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                {plan.period && plan.period !== "forever" && (
                  <span className="text-slate-500 text-sm">/{plan.period}</span>
                )}
                {plan.period === "forever" && (
                  <span className="text-slate-500 text-sm">forever</span>
                )}
              </div>
              <p className="text-sm leading-7 text-slate-600 mt-2 mb-6">{plan.description}</p>
              <ul className="space-y-3 text-sm text-slate-700 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fire" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/claim"
                className={`block text-center rounded-full py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-fire text-white shadow-glow-fire hover:bg-fire/90"
                    : "border border-slate-200 text-slate-700 hover:border-fire hover:text-fire"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Emergency dispatch strip */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-fire/20 bg-fire/5 px-5 py-3 text-sm text-slate-700">
          <Zap className="h-4 w-4 text-fire shrink-0" />
          <span>
            <strong className="text-fire">Plus add-on:</strong> Emergency dispatch — 15% routing fee on urgent callouts. Available on Growth and Pro plans.
          </span>
        </div>

        {/* Revenue model */}
        <div className="mt-16 grid gap-10 lg:grid-cols-2 items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-fire/20 bg-fire/5 px-4 py-1.5 text-sm font-medium text-fire mb-4">
              <TrendingUp className="h-4 w-4" />
              Revenue model explained
            </div>
            <h2 className="text-3xl font-bold text-slate-900">The numbers make sense</h2>
            <p className="mt-3 text-slate-600 text-sm leading-7">
              Growth plan workshops consistently see a return that makes the subscription obvious. Here&apos;s a typical month:
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-fire" />
              Growth plan ROI example
            </h3>
            <div className="space-y-4 text-sm">
              {[
                { label: "Lead credits used", value: "10 leads" },
                { label: "Average lead cost", value: "R35 avg" },
                { label: "Close rate", value: "30% (3 jobs)" },
                { label: "Average job value", value: "R3,500" },
                { label: "Revenue generated", value: "R10,500" },
                { label: "Plan + lead cost", value: "R799 + R350 = R1,149" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold text-slate-900">{value}</span>
                </div>
              ))}
              <div className="rounded-2xl bg-fire/10 p-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">ROI</span>
                  <span className="text-2xl font-bold text-fire">~9x</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">At scale: 10 leads × R35 × 30% close × R3,500 job = R10,500 revenue on R1,149 spend</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why workshops convert */}
        <div className="mt-16 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-950 mb-5">Why workshops convert on this offer</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm text-slate-600">
            {[
              "Claim and clean your listing before lower-quality directories rank above you",
              "Pay for real quote intent, not vanity impressions",
              "See response time, lead source, and close-rate data",
              "Buy category or city boosts once ROI is clear",
              "Prepare for future parts upsells and fleet opportunities",
              "WhatsApp lead notifications so you never miss a booking",
            ].map((reason) => (
              <div key={reason} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fire" />
                {reason}
              </div>
            ))}
          </div>
          <Link
            href="/claim"
            className="mt-8 inline-flex rounded-full bg-fire px-7 py-3.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
          >
            Claim your workshop
          </Link>
        </div>
      </div>
    </div>
  );
}
