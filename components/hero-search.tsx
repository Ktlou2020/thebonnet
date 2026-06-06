import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CityHighlight, ServiceCategory } from "@/lib/types";

export function HeroSearch({
  cityHighlights,
  serviceCategories
}: {
  cityHighlights: CityHighlight[];
  serviceCategories: ServiceCategory[];
}) {
  return (
    <div className="rounded-[2rem] border border-fire/15 bg-white p-6 shadow-glow">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-fire/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-fire">
        Customer-ready directory
      </div>
      <h2 className="mt-3 text-2xl font-bold leading-snug text-slate-950">
        Search by city, compare trusted workshops, and request quotes in one place.
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-500">
        My Bonnet gives South African drivers a cleaner way to find workshops, compare public listing details, and choose between in-store and mobile mechanics.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Popular cities</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {cityHighlights.slice(0, 6).map((item) => (
              <Link
                key={item.city}
                href={`/mechanics?city=${encodeURIComponent(item.city)}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-fire/30 hover:text-fire"
              >
                {item.city} &middot; {item.count}
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Popular services</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {serviceCategories.slice(0, 6).map((item) => (
              <Link
                key={item}
                href={`/mechanics?service=${encodeURIComponent(item)}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-fire/30 hover:text-fire"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/mechanics"
          className="group inline-flex items-center gap-2 rounded-full bg-fire px-5 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
        >
          Browse mechanics
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link href="/request-quote" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
          Request a quote
        </Link>
      </div>
    </div>
  );
}
