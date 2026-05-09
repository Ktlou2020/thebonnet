import Link from "next/link";
import { Clock3, ShieldCheck, Star, Wrench } from "lucide-react";
import { Mechanic } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function MechanicCard({ mechanic }: { mechanic: Mechanic }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1">
      <div className="flex flex-wrap items-center gap-2">
        {mechanic.featured ? <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-amber-700">Featured</span> : null}
        {mechanic.badges.map((badge) => (
          <span key={badge} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {badge}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950">{mechanic.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {mechanic.city}, {mechanic.province} · {mechanic.yearsInBusiness} years in business
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right">
          <div className="flex items-center justify-end gap-1 text-sm font-semibold text-slate-900">
            <Star className="h-4 w-4 fill-gold text-gold" />
            {mechanic.rating}
          </div>
          <div className="text-xs text-slate-500">{mechanic.reviewCount} reviews</div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-600">{mechanic.about}</p>
      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-accent" /> Responds in {mechanic.responseTime}</div>
        <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> {mechanic.warranty}</div>
        <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-accent" /> {formatCurrency(mechanic.hourlyRate)}/hr</div>
        <div>Accreditations: {mechanic.accreditations.join(", ")}</div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {mechanic.services.map((service) => (
          <span key={service} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            {service}
          </span>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/mechanics/${mechanic.slug}`} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-bonnet">
          View listing
        </Link>
        <Link href="/request-quote" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
          Request quote
        </Link>
      </div>
    </div>
  );
}
