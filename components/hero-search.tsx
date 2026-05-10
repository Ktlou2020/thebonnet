import Link from "next/link";
import { CityHighlight, ServiceCategory } from "@/lib/types";

export function HeroSearch({
  cityHighlights,
  serviceCategories
}: {
  cityHighlights: CityHighlight[];
  serviceCategories: ServiceCategory[];
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Live launch directory</p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-950">Search by city, compare trusted workshops, and request quotes in one place.</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        The Bonnet gives South African drivers a cleaner way to find workshops, compare public listing details, and choose between in-store and mobile mechanics.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Popular cities</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {cityHighlights.slice(0, 6).map((item) => (
              <Link key={item.city} href={`/mechanics?city=${encodeURIComponent(item.city)}`} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100">
                {item.city} · {item.count}
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Popular services</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {serviceCategories.slice(0, 6).map((item) => (
              <Link key={item} href={`/mechanics?service=${encodeURIComponent(item)}`} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/mechanics" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-bonnet">
          Browse mechanics
        </Link>
        <Link href="/request-quote" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
          Request a quote
        </Link>
      </div>
    </div>
  );
}
