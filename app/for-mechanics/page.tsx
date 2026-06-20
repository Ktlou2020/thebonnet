import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, Star, TrendingUp, Zap } from "lucide-react";
import { subscriptionPlans } from "@/lib/workshops";

const stats = [
  { value: "500+", label: "workshops listed" },
  { value: "10k+", label: "drivers active" },
  { value: "4.8★", label: "avg workshop rating" },
  { value: "3×", label: "faster close rate" },
];

export default function ForMechanicsPage() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_10%_0%,#1a3b6c,transparent_45%),linear-gradient(180deg,#08111f,#0b1730)] px-6 py-24 text-white lg:px-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-fire/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90">
            <ShieldCheck className="h-4 w-4 text-fire" /> South Africa&apos;s trusted mechanic marketplace
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-tight sm:text-6xl">
            Get more jobs.<br />
            <span className="bg-gradient-to-r from-fire to-amber-400 bg-clip-text text-transparent">Grow your workshop.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            My Bonnet connects your workshop with qualified drivers actively looking for your services. No cold calls. No wasted spend. Just jobs that match what you do.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/claim" className="inline-flex items-center gap-2 rounded-full bg-fire px-7 py-3.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90">
              List your workshop free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/mechanics" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/5">
              See the directory
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-fire">{s.value}</div>
                <div className="mt-1 text-sm text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-slate-50 py-16 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-slate-900 mb-10">How it works for workshops</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: "1", title: "List your workshop", body: "Claim your free profile in under 5 minutes. Add your services, location, opening hours, and photos." },
              { step: "2", title: "Receive qualified leads", body: "Drivers in your city send quote requests filtered to your services. You get WhatsApp and email alerts immediately." },
              { step: "3", title: "Quote and close", body: "Respond with your price, ETA, and message. Accept the job and build your review score with every completed booking." },
            ].map(({ step, title, body }) => (
              <div key={step} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-fire/10 text-sm font-black text-fire">{step}</div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 px-6 lg:px-8 bg-ink text-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold mb-10">Trusted by workshops across South Africa</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "James M.", city: "Cape Town", text: "Within the first week I had 3 quote requests. The response rate is incredible compared to walking-in traffic.", rating: 5 },
              { name: "Thabo K.", city: "Johannesburg", text: "I was sceptical, but the verified badge and review system actually builds trust. Customers mention My Bonnet when they call.", rating: 5 },
              { name: "Priya N.", city: "Durban", text: "The dashboard shows me exactly where my leads come from. I've doubled my bookings in two months.", rating: 5 },
            ].map(({ name, city, text, rating }) => (
              <div key={name} className="rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}
                </div>
                <p className="text-sm leading-7 text-slate-300">&ldquo;{text}&rdquo;</p>
                <div className="mt-5 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-fire/20 text-sm font-bold text-fire">{name[0]}</div>
                  <div>
                    <div className="text-sm font-semibold text-white">{name}</div>
                    <div className="text-xs text-slate-400">{city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Simple, transparent pricing</h2>
          <p className="mt-3 text-slate-600">Start free. Upgrade when you&apos;re ready to grow.</p>
        </div>
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
