import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle, MessageSquareShare, Search, ShieldCheck, Star, Wrench } from "lucide-react";
import { HeroSearch } from "@/components/hero-search";
import { MechanicCard } from "@/components/mechanic-card";
import { PriceCard } from "@/components/price-card";
import { SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { consumerPlans, getHomePageData } from "@/lib/workshops";

const steps = [
  {
    icon: Search,
    title: "AI-diagnose your issue",
    copy: "Describe what's wrong in plain English. Our AI identifies likely causes, estimates costs, and writes a mechanic brief you can share."
  },
  {
    icon: MessageSquareShare,
    title: "Get matched quotes",
    copy: "Send one request to workshops that match your location, vehicle, and service type. Compare responses in one place."
  },
  {
    icon: Wrench,
    title: "Book and track everything",
    copy: "Book the right workshop and log the service in My Garage to track costs and history over time."
  }
];

const trustPoints = [
  "Real workshop data from public listings",
  "City-first browsing for South African drivers",
  "Direct call, website, and quote request paths",
  "Mobile and after-hours mechanic options where available"
];

const garageFeatures = [
  "Track all vehicles in one place",
  "Full service history and cost tracker",
  "Maintenance reminders and health indicators",
];

export default async function HomePage() {
  const { cityHighlights, featuredMechanics, metrics, priceBenchmarks, serviceCategories, subscriptionPlans } = await getHomePageData();

  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="bg-[radial-gradient(circle_at_top,#183968,transparent_40%),linear-gradient(180deg,#08111f,#0b1730)]">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-16 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-fire" />
                South African mechanic marketplace — customer ready
              </div>
              <h1 className="mt-6 max-w-3xl text-5xl font-bold tracking-tight text-white sm:text-6xl">
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
                  href="/ai-diagnose"
                  className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
                >
                  Diagnose my issue →
                </Link>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                or{" "}
                <Link href="/request-quote" className="underline underline-offset-2 hover:text-slate-200 transition">
                  request a quote directly →
                </Link>
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {trustPoints.map((item) => (
                  <span key={item} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{item}</span>
                ))}
              </div>
            </div>
            <HeroSearch cityHighlights={cityHighlights} serviceCategories={serviceCategories} />
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((item) => <StatCard key={item.label} item={item} />)}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="A smarter mechanic journey for South African drivers"
          description="From AI diagnosis to matched quotes to full service history — The Bonnet connects every step so drivers make better decisions faster."
        />
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

      {/* ─── AI Diagnosis section ─── */}
      <section className="bg-ink py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-fire/30 bg-fire/10 px-4 py-1.5 text-sm font-medium text-fire mb-4">
                AI-powered
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Describe your car problem in plain English
              </h2>
              <p className="mt-4 text-slate-300 leading-8">
                Our AI identifies the most likely causes, estimates repair costs in ZAR, and generates a clear mechanic brief you can copy and share. No jargon, no guessing.
              </p>
              <Link
                href="/ai-diagnose"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-fire px-7 py-3.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
              >
                Try the AI diagnosis → <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Preview card */}
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Example diagnosis</p>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Fix Soon</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Likely cause</p>
                <p className="text-white font-medium text-sm">Worn brake pads — high likelihood</p>
                <p className="text-slate-400 text-xs mt-1 leading-5">
                  The grinding noise on braking is a common indicator of brake pad wear. Typically caused by metal-on-rotor contact as pad material depletes.
                </p>
              </div>
              <div className="rounded-2xl bg-fire/10 p-4">
                <p className="text-xs text-slate-400 mb-1">Estimated cost</p>
                <p className="text-3xl font-bold text-fire">R1,800 – R2,600</p>
                <p className="text-xs text-slate-400 mt-1">Independent workshop, labour + parts, Cape Town</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2">Mechanic brief</p>
                <p className="text-sm text-slate-300 leading-6 line-clamp-3 italic">
                  &ldquo;My 2019 VW Polo makes a grinding noise when braking, especially at low speed. Likely brake pad wear on front axle. Please inspect pad thickness and rotor condition...&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── My Garage section ─── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-medium text-slate-700 mb-4">
                My Garage
              </div>
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Own your car&apos;s full history
              </h2>
              <p className="mt-4 text-slate-600 leading-8">
                Log every service, track total spend, and always know when your next maintenance is due. Your garage stays with you across every workshop visit.
              </p>
              <ul className="mt-6 space-y-3">
                {garageFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 text-fire shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/garage"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-fire px-7 py-3.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
              >
                Open My Garage → <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Mock vehicle card */}
            <div className="space-y-4">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400 font-medium">2021 Toyota</p>
                    <h3 className="text-xl font-bold text-slate-900">Hilux</h3>
                    <p className="text-sm text-fire font-medium mt-0.5">&ldquo;The Beast&rdquo;</p>
                  </div>
                  <span className="h-3 w-3 rounded-full bg-green-400 mt-1.5" title="Serviced within 6 months" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-slate-400 text-xs mb-1">Last service</p>
                    <p className="font-semibold text-slate-900">3 months ago</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-slate-400 text-xs mb-1">Total spend</p>
                    <p className="font-semibold text-slate-900">R12,400</p>
                  </div>
                </div>
              </div>
              {/* XP bar */}
              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-semibold text-slate-900">Regular Driver • Level 2</span>
                  <span className="text-slate-400">340 XP</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-[70%] rounded-full bg-fire" />
                </div>
                <p className="text-xs text-slate-400 mt-2">130 XP to next level</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bonnet Plus section ─── */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-fire/20 bg-fire/5 px-4 py-1.5 text-sm font-medium text-fire mb-4">
              For drivers
            </div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Own your car&apos;s health, not just react to it.
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 max-w-3xl mx-auto">
            {consumerPlans.map((plan) => (
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
                    Best value
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2 mb-1">
                  <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                  {plan.name !== "Free" && <span className="text-slate-500 text-sm">/month</span>}
                </div>
                <p className="text-sm text-slate-600 mb-5">{plan.description}</p>
                <ul className="space-y-2 text-sm text-slate-700 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fire" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/garage"
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
                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">{item.count}</div>
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
              <SectionHeading
                eyebrow="For workshops"
                title="Client-facing now, monetisable as the traffic grows"
                description="The customer experience comes first. Once traffic builds, workshops can pay for better placement, richer trust cards, faster lead handling, and city-level visibility without hurting the buyer journey."
              />
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
                <div
                  key={plan.name}
                  className={`rounded-[2rem] p-6 backdrop-blur transition ${
                    plan.highlighted
                      ? "border-2 border-fire bg-white/10"
                      : "border border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold">{plan.name}</h3>
                    {plan.highlighted && <BadgeCheck className="h-5 w-5 text-fire" />}
                  </div>
                  <p className="mt-3 text-3xl font-bold">{plan.price}</p>
                  {plan.period && plan.period !== "forever" && (
                    <span className="text-slate-400 text-sm">/{plan.period}</span>
                  )}
                  <p className="mt-3 text-sm leading-7 text-slate-300">{plan.description}</p>
                  <ul className="mt-6 space-y-3 text-sm text-slate-200">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fire" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/for-mechanics"
                    className={`mt-6 inline-flex rounded-full px-4 py-2 text-sm font-semibold transition ${
                      plan.highlighted
                        ? "bg-fire text-white shadow-glow-fire hover:bg-fire/90"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency dispatch strip */}
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-fire/20 bg-fire/10 px-5 py-3 text-sm text-slate-200">
            <span className="h-2 w-2 rounded-full bg-fire shrink-0" />
            <span>
              <strong className="text-fire">Plus add-on:</strong> Emergency dispatch — 15% routing fee on urgent callouts. Available on Growth and Pro plans.
            </span>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {serviceCategories.map((item) => (
              <span key={item} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{item}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
