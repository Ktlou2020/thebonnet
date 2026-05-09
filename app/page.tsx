import Link from "next/link";
import { ArrowRight, BadgeCheck, ChartColumnBig, MessageSquareShare, Shield, ShoppingCart, Sparkles } from "lucide-react";
import { HeroSearch } from "@/components/hero-search";
import { MechanicCard } from "@/components/mechanic-card";
import { PriceCard } from "@/components/price-card";
import { SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { mechanics, metrics, priceBenchmarks, subscriptionPlans } from "@/lib/data";

const pillars = [
  {
    icon: Shield,
    title: "Verification-first supply",
    copy: "Profiles are designed for claim flows, accreditation checks, warranty display, and city-by-city moderation rather than blind scraping."
  },
  {
    icon: MessageSquareShare,
    title: "Lead generation that converts",
    copy: "Quote requests, WhatsApp routing, fast-response scoring, and workshop analytics help mechanics see ROI and pay for visibility."
  },
  {
    icon: ChartColumnBig,
    title: "Fair Price Index moat",
    copy: "Service benchmarks create consumer trust, fuel SEO landing pages, and later power dynamic lead pricing and commerce recommendations."
  },
  {
    icon: ShoppingCart,
    title: "Future commerce ready",
    copy: "The architecture already supports later expansion into parts, tyres, batteries, and bundled service kits without a replatform."
  }
];

export default function HomePage() {
  return (
    <div>
      <section className="bg-[radial-gradient(circle_at_top,#183968,transparent_40%),linear-gradient(180deg,#08111f,#0b1730)]">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-16 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 backdrop-blur">
                <Sparkles className="h-4 w-4 text-accent" />
                Built as a premium rebuild of The Bonnet
              </div>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                South Africa&apos;s best platform to find, compare, and book trusted mechanics.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                A marketplace-first rebuild focused on verified workshops, fair-price intelligence, and monetizable lead generation for independent mechanics.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/request-quote" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-ink transition hover:bg-accent/90">
                  Get matched now
                </Link>
                <Link href="/for-mechanics" className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30">
                  Grow my workshop
                </Link>
              </div>
            </div>
            <HeroSearch />
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((item) => (
              <StatCard key={item.label} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Platform strategy"
          title="Built to win trust before it tries to win volume"
          description="The strongest version of this business is not a generic directory. It is a verification layer, a lead marketplace, and a pricing intelligence engine for South African aftersales."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <div className="inline-flex rounded-2xl bg-accent/10 p-3 text-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{pillar.copy}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Verified supply"
              title="Example mechanic listings"
              description="Seeded listings show the new information architecture: trust badges, real services, accreditations, pricing, and clear lead CTAs."
            />
            <Link href="/mechanics" className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
              Browse all mechanics <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {mechanics.slice(0, 3).map((mechanic) => (
              <MechanicCard key={mechanic.id} mechanic={mechanic} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeading
            eyebrow="Fair Price Index"
            title="Turn price transparency into your moat"
            description="These benchmark cards are the core of consumer trust, content SEO, and lead qualification. Each quote can be compared to a local independent range and dealership average."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {priceBenchmarks.map((item) => (
              <PriceCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="Monetization"
            title="Plans mechanics can actually understand"
            description="Free claim profiles create supply. Growth and Pro packages monetize visibility, lead tools, and analytics once workshop owners can see measurable results."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <div key={plan.name} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold">{plan.name}</h3>
                  {plan.name !== "Free" ? <BadgeCheck className="h-5 w-5 text-accent" /> : null}
                </div>
                <p className="mt-3 text-4xl font-semibold">{plan.price}</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{plan.description}</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-200">
                  {plan.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
                <Link href="/for-mechanics" className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink">
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
