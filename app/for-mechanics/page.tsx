import Link from "next/link";
import { subscriptionPlans } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";

const reasons = [
  "Claim and clean your listing before lower-quality directories rank above you",
  "Pay for real quote intent, not vanity impressions",
  "See response time, lead source, and close-rate data",
  "Buy category or city boosts once ROI is clear",
  "Prepare for future parts upsells and fleet opportunities"
];

export default function ForMechanicsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeading
          eyebrow="Workshop growth"
          title="A lead generation platform mechanics will actually pay for"
          description="The Bonnet is built around measurable workshop value: qualified leads, premium placement, WhatsApp conversion, and analytics that show exactly what advertising spend produced."
        />
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-950">Why workshops convert on this offer</h2>
          <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
            {reasons.map((reason) => (
              <li key={reason}>• {reason}</li>
            ))}
          </ul>
          <Link href="/claim" className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
            Claim your workshop
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {subscriptionPlans.map((plan) => (
          <div key={plan.name} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-semibold text-slate-950">{plan.name}</h3>
            <p className="mt-2 text-4xl font-semibold text-slate-950">{plan.price}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{plan.description}</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
