import { Metadata } from "next";
import Link from "next/link";
import { MechanicCard } from "@/components/mechanic-card";
import { getMechanics, filterMechanics } from "@/lib/workshops";

import { SERVICE_AREAS } from "@/lib/areas";

function citySlugToName(slug: string): string {
  return SERVICE_AREAS.find((c) => c.toLowerCase().replace(/\s+/g, "-") === slug) ?? slug;
}

export async function generateStaticParams() {
  return SERVICE_AREAS.map((area) => ({ city: area.toLowerCase().replace(/\s+/g, "-") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const cityName = citySlugToName(slug);
  return {
    title: `Car Mechanics in ${cityName}, Johannesburg | My Bonnet`,
    description: `Find trusted mechanics and workshops in ${cityName}, Joburg. Compare ratings, services, and request quotes — all in one place.`,
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const cityName = citySlugToName(slug);

  const mechanics = await getMechanics();
  const filtered = filterMechanics(mechanics, { city: cityName });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-ink text-white px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mb-4">
            <Link href="/mechanics" className="hover:text-white transition">Directory</Link>
            <span>/</span>
            <span className="text-white">{cityName}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Car mechanics in {cityName}
          </h1>
          <p className="mt-3 text-slate-300">
            {filtered.length} workshop{filtered.length !== 1 ? "s" : ""} found in {cityName}, South Africa
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {filtered.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((mechanic) => (
              <MechanicCard key={mechanic.slug} mechanic={mechanic} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">No workshops listed for {cityName} yet</h2>
            <p className="mt-3 text-sm text-slate-600">Request a quote anyway — we&apos;ll find you a workshop.</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-[2rem] bg-ink text-white p-8 text-center">
          <h2 className="text-2xl font-bold">Can&apos;t find what you need?</h2>
          <p className="mt-2 text-slate-300">Request a quote and we&apos;ll match you with a trusted workshop in {cityName}.</p>
          <Link
            href={`/request-quote?city=${encodeURIComponent(cityName)}`}
            className="mt-6 inline-flex rounded-full bg-fire px-7 py-3.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
          >
            Request a quote in {cityName}
          </Link>
        </div>
      </div>
    </div>
  );
}
