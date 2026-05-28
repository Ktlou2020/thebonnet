import Link from "next/link";
import { ArrowRight, BadgeCheck, MessageSquareShare, Search, ShieldCheck, Star, Wrench } from "lucide-react";
import { HeroSearch } from "@/components/hero-search";
import { MechanicCard } from "@/components/mechanic-card";
import { PriceCard } from "@/components/price-card";
import { SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { getHomePageData } from "@/lib/workshops";

const steps = [
  {
    icon: Search,
    title: "Browse real workshop listings",
    copy: "Start with curated public workshop listings organised by city, service type, and mobile support so you can shortlist faster."
  },
  {
    icon: MessageSquareShare,
    title: "Send one quote request",
    copy: "Tell us your location, vehicle, and issue once, then route that request to workshops that fit the job."
  },
  {
    icon: Wrench,
    title: "Book the right workshop",
    copy: "Compare public ratings, contact details, operating hours, and specialities before you decide who to call."
  }
];

const trustPoints = [
  "Real workshop data from public listings",
  "City-first browsing for South African drivers",
  "Direct call, website, and quote request paths",
  "Mobile and after-hours mechanic options where available"
];

export default async function HomePage() {
  const { cityHighlights, featuredMechanics, metrics, priceBenchmarks, serviceCategories, subscriptionPlans } = await getHomePageData();

  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-5%,#1b3d6e,transparent),linear-gradient(180deg,#060d1a_0%,#0a1628_60%,#0e1e36_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_80%_70%,rgba(249,115,22,0.07),transparent)]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-16 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-fire/30 bg-fire/10 px-4 py-2 text-sm font-medium text-white/90">
                <ShieldCheck className="h-4 w-4 text-fire" />
                South African mechanic marketplace — customer ready
              </div>

              <h1 className="mt-6 max-w-3xl text-5xl font-bold tracking-tight text-white sm:text-6xl lg:leading-[1.08]">
                Find a mechanic{" "}
                <span className="bg-gradient-to-r from-fire to-amber-400 bg-clip-text text-transparent">faster</span>
                , compare better, and get quotes without the directory chaos.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                The Bonnet is building a customer-first search and quote experience for South African drivers using real workshop data, cleaner discovery, and clearer contact paths.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/mechanics"
                  className="group inline-flex items-center gap-2 rounded-full bg-fire px-7 py-3.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 hover:scale-[1.02] active:scale-100"
                >
                  Explore mechanics
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/request-quote"
                  className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
                >
                  Request a quote
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {trustPoints.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs text-slate-200">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <HeroSearch cityHighlights={cityHighlights} serviceCategories={serviceCategories} />
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((item) => <StatCard key={item.label} item={item} />)}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading eyebrow="How it works" title="A cleaner mechanic search journey for real customers" description="The Bonnet keeps the experience intentionally simple: better browsing, clearer trust signals, and one quote form that can evolve into full lead routing as the marketplace grows." />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-fire/20">
                <div className="inline-flex rounded-2xl bg-fire/10 p-3 text-fire transition group-hover:bg-fire/15">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">Step {i + 1}</div>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.copy}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Featured listings ─── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Featured listings" title="Workshops customers can contact today" description="The homepage highlights workshop listings with public ratings, service tags, hours, and direct contact options instead of thin placeholder cards." />
            <Link href="/mechanics" className="inline-flex items-center gap-2 text-sm font-semibold text-fire transition hover:text-fire/80">
              Browse all cities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {featuredMechanics.map((mechanic) => <MechanicCard key={mechanic.slug} mechanic={mechanic} />)}
          </div>
        </div>
      </section>

      {/* ─── City coverage ─── */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeading eyebrow="Coverage" title="Browse city coverage" description="The directory focuses on cities where workshop choice is broad and driver intent is already strong, giving customers a practical place to start." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cityHighlights.map((item) => (
              <Link key={item.city} href={`/mechanics?city=${encodeURIComponent(item.city)}`} className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-fire/20">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{item.city}</h3>
                    <p className="mt-1 text-sm text-slate-500">{item.province}</p>
                  </div>
                  <div className="rounded-2xl bg-fire/10 px-3 py-2 text-sm font-bold text-fire">{item.count}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing beta ─── */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
            <SectionHeading eyebrow="Pricing beta" title="Fair Price Index is intentionally conservative for now" description="Pricing only belongs on the platform where there is enough evidence. The Bonnet starts with a transparent benchmark and expands as more first-party quote data comes in." />
            <div className="space-y-4">
              {priceBenchmarks.map((item) => <PriceCard key={item.id} item={item} />)}
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600 shadow-soft">Each benchmark card should remain source-aware and conservative until the platform has enough real quote and invoice data to widen coverage.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── For workshops ─── */}
      <section className="bg-ink py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <SectionHeading eyebrow="For workshops" title="Client-facing now, monetisable as the traffic grows" description="The customer experience comes first. Once traffic builds, workshops can pay for better placement, richer trust cards, faster lead handling, and city-level visibility without hurting the buyer journey." />
              <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-fire/15 p-3 text-fire"><Star className="h-5 w-5" /></div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Why workshops will care</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">Better customer acquisition, clearer city discovery, and qualified lead capture turn public workshop listings into a real performance channel.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {subscriptionPlans.map((plan) => (
                <div key={plan.name} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-fire/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold">{plan.name}</h3>
                    {plan.name !== "Free" ? <BadgeCheck className="h-5 w-5 text-fire" /> : null}
                  </div>
                  <p className="mt-3 text-4xl font-bold">{plan.price}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{plan.description}</p>
                  <ul className="mt-6 space-y-3 text-sm text-slate-200">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fire" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/for-mechanics" className="mt-6 inline-flex rounded-full bg-fire px-4 py-2 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90">{plan.cta}</Link>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {serviceCategories.map((item) => (
              <span key={item} className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-slate-300">{item}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
