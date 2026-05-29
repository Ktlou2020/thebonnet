import Link from "next/link";
import { Globe, MapPin, PhoneCall, Star } from "lucide-react";
import { Mechanic } from "@/lib/types";

export function MechanicCard({ mechanic }: { mechanic: Mechanic }) {
  const telHref = mechanic.phone ? `tel:${mechanic.phone.replace(/\s+/g, "")}` : null;
  const quoteHref = `/request-quote?${new URLSearchParams({
    city: mechanic.city,
    service: mechanic.services[0] ?? "General Service"
  }).toString()}`;

  return (
    <div className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-fire/20">
      <div className="flex flex-wrap items-center gap-2">
        {mechanic.featured ? <span className="rounded-full bg-fire/10 px-3 py-1 text-xs font-semibold text-fire">Featured</span> : null}
        {mechanic.mobile ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Mobile support</span> : null}
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{mechanic.source}</span>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-slate-950">{mechanic.name}</h3>
          <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-fire" />
            <span>{mechanic.address}</span>
          </p>
        </div>
        <div className="shrink-0 rounded-2xl bg-amber-50 px-3 py-2 text-right">
          <div className="flex items-center justify-end gap-1 text-sm font-bold text-amber-700">
            <Star className="h-4 w-4 fill-gold text-gold" />
            {mechanic.rating.toFixed(1)}
          </div>
          <div className="text-xs text-slate-500">Public rating</div>
          {mechanic.responseTimeLabel && (
            <div className="text-xs text-slate-500 mt-1">{mechanic.responseTimeLabel}</div>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">{mechanic.hours}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {mechanic.services.map((service) => (
          <span key={service} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {service}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {mechanic.types.slice(0, 3).map((type) => (
          <span key={type} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
            {type}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/mechanics/${mechanic.slug}`} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-bonnet">
          View listing
        </Link>
        <Link href={quoteHref} className="rounded-full bg-fire px-4 py-2 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90">
          Request quote
        </Link>
        {telHref ? (
          <a href={telHref} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300">
            <PhoneCall className="mr-2 inline-flex h-4 w-4" />
            Call
          </a>
        ) : null}
        {mechanic.website ? (
          <a href={mechanic.website} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300">
            <Globe className="mr-2 inline-flex h-4 w-4" />
            Website
          </a>
        ) : null}
      </div>
    </div>
  );
}
