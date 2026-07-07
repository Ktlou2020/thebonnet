import Link from "next/link";
import { ArrowRight, Building2, MessageSquareShare, Search, ShieldCheck, Sparkles, Star, TrendingUp, Wrench } from "lucide-react";
import { CitySearchWidget } from "@/components/city-search-widget";
import { AnimatedStat } from "@/components/animated-stat";
import { WorkshopCard } from "@/components/workshop-card";
import { DRIVER_LEVELS } from "@/lib/gamification";
import { getHomePageData } from "@/lib/workshops";
import { JOBURG_NORTH, JOBURG_WEST } from "@/lib/areas";

export const dynamic = "force-dynamic";

const steps = [
  {
    icon: Search,
    title: "Search & filter",
    copy: "Find verified workshops near you by suburb, service type, and rating. No directory chaos — just the right matches.",
  },
  {
    icon: MessageSquareShare,
    title: "Send one enquiry",
    copy: "Tell us what you need once. We route it to multiple matching workshops so the quotes come to you.",
  },
  {
    icon: Wrench,
    title: "Compare & book",
    copy: "Compare quotes side by side, pick the best workshop, book the job, and leave a review to earn XP.",
  },
];

const areas = [
  ...JOBURG_NORTH.map((name) => ({ name, region: "Joburg North" })),
  ...JOBURG_WEST.map((name) => ({ name, region: "Joburg West" })),
];

const workshopValueProps = [
  "Get matched with drivers who need your services — no cold leads",
  "Build trust with verified badges, reviews, and response-time signals",
  "Manage enquiries, send quotes, and track performance in one dashboard",
];

export default async function HomePage() {
  const { cityHighlights, featuredMechanics, mechanics, serviceCategories } = await getHomePageData();
  const showcase = (featuredMechanics.length ? featuredMechanics : mechanics).slice(0, 6);
  const cityNames = cityHighlights.map((c) => c.city);
  const cityCountMap = Object.fromEntries(cityHighlights.map((c) => [c.city, c.count]));

  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_20%_-10%,#1a3b6c,transparent_45%),radial-gradient(circle_at_90%_20%,#3a1d0a,transparent_40%),linear-gradient(180deg,#08111f,#0b1730)]">
        {/* Floating CSS illustration elements */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-10 top-24 h-40 w-40 rounded-full bg-fire/10 blur-3xl" />
          <div className="absolute right-10 top-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
          <Wrench className="absolute right-[8%] top-[30%] h-24 w-24 rotate-12 text-white/[0.04]" />
          <div className="absolute left-[6%] bottom-[12%] h-16 w-16 rounded-2xl border border-white/[0.06]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-20 text-center lg:px-8 lg:pb-28 lg:pt-28">
          <div className="flex flex-wrap justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-fire" />
              Joburg North &amp; West&apos;s trusted mechanic marketplace
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent backdrop-blur">
              Always free for drivers
            </div>
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-black tracking-tight text-white sm:text-6xl">
            Find a mechanic{" "}
            <span className="bg-gradient-to-r from-fire to-amber-400 bg-clip-text text-transparent">you can trust</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Compare verified workshops, get instant quotes, and track every service — all in one place.
          </p>

          <div className="mx-auto mt-10 max-w-3xl">
            <CitySearchWidget cities={cityNames} services={serviceCategories} />
          </div>

          <p className="mt-4 text-sm text-slate-400">No subscriptions. No hidden fees.</p>

          {/* Trust strip */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /> Joburg North &amp; West drivers</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> Verified local workshops</span>
            <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 fill-gold text-gold" /> 4.8★ average rating</span>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-fire/20 bg-fire/5 px-4 py-1.5 text-sm font-semibold text-fire">
            How it works
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Three steps to a better repair</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">From search to booked job, My Bonnet makes finding the right workshop simple.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="group rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:border-fire/20">
                <div className="inline-flex rounded-2xl bg-fire/10 p-3 text-fire transition group-hover:bg-fire/15">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-5 text-xs font-bold uppercase tracking-widest text-slate-400">Step {i + 1}</div>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.copy}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Featured workshops ─── */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700">
                Featured workshops
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Top-rated mechanics, ready today</h2>
            </div>
            <Link href="/mechanics" className="inline-flex items-center gap-2 text-sm font-semibold text-fire transition hover:text-fire/80">
              Browse all workshops <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {showcase.map((mechanic) => <WorkshopCard key={mechanic.slug} mechanic={mechanic} />)}
          </div>
        </div>
      </section>

      {/* ─── Gamification preview ─── */}
      <section className="bg-ink py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-fire/30 bg-fire/10 px-4 py-1.5 text-sm font-medium text-fire">
                <Sparkles className="h-4 w-4" /> Rewards
              </div>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Joburg drivers earning rewards every service</h2>
              <p className="mt-4 leading-8 text-slate-300">
                Every review you write, vehicle you log, and service you track earns XP. Level up from Rookie to Legend and unlock perks along the way.
              </p>
              <Link
                href="/garage"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-fire px-7 py-3.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
              >
                Start earning XP <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {DRIVER_LEVELS.map((level, i) => (
                <div
                  key={level.level}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur"
                  style={{ marginLeft: `${i * 12}px` }}
                >
                  <span className="text-2xl" aria-hidden>{level.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{level.name}</div>
                    <div className="text-xs text-slate-400">{level.minXp.toLocaleString()}+ XP</div>
                  </div>
                  <span className="rounded-full bg-fire/15 px-3 py-1 text-xs font-bold text-fire">Level {level.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Area grid ─── */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Mechanics near you</h2>
          <p className="mt-3 text-slate-600">Browse trusted workshops across Joburg North and West.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {areas.map((area) => {
            const count = cityCountMap[area.name];
            return (
              <Link
                key={area.name}
                href={`/mechanics?city=${encodeURIComponent(area.name)}`}
                className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-fire/20"
              >
                <h3 className="font-semibold text-slate-950 transition group-hover:text-fire">{area.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{area.region}</p>
                {count != null && count > 0 && (
                  <p className="mt-2 text-xs font-semibold text-fire">{count} workshop{count === 1 ? "" : "s"}</p>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Workshop CTA ─── */}
      <section className="bg-ink py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/90">
                <Building2 className="h-4 w-4 text-fire" /> For workshops
              </div>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Own a workshop?</h2>
              <p className="mt-4 leading-8 text-slate-300">
                List your business free, receive qualified enquiries, and grow your reputation with reviews and performance badges.
              </p>
              <Link
                href="/for-mechanics"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-fire px-7 py-3.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
              >
                List your workshop free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="space-y-4">
              {workshopValueProps.map((prop) => (
                <li key={prop} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span className="text-sm leading-7 text-slate-200">{prop}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Stats bar ─── */}
      <section className="bg-[linear-gradient(180deg,#0b1730,#08111f)] py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 lg:grid-cols-4 lg:px-8">
          <AnimatedStat value={16} suffix="" label="Areas covered" />
          <AnimatedStat value={4.8} suffix="★" label="Average workshop rating" />
          <AnimatedStat value={2} suffix=" regions" label="Joburg North &amp; West" />
          <AnimatedStat value={100} suffix="%" label="Free for drivers" />
        </div>
      </section>
    </div>
  );
}
