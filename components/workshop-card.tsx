import Link from "next/link";
import { ArrowRight, Clock, MapPin, ShieldCheck, Star } from "lucide-react";
import type { Mechanic } from "@/lib/types";

const GRADIENTS = [
  "from-fire/80 to-amber-500",
  "from-ink to-bonnet",
  "from-accent to-teal-600",
  "from-violet-500 to-indigo-600",
  "from-rose-500 to-orange-500",
  "from-sky-500 to-blue-700",
];

function gradientFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

export function WorkshopCard({ mechanic }: { mechanic: Mechanic }) {
  const quoteHref = `/request-quote?${new URLSearchParams({
    city: mechanic.city,
    service: mechanic.services[0] ?? "General Service",
  }).toString()}`;
  const initials = mechanic.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="group flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/mechanics/${mechanic.slug}`} className="relative block">
        <div className={`flex h-44 items-center justify-center bg-gradient-to-br ${gradientFor(mechanic.slug)}`}>
          <span className="text-4xl font-black tracking-tight text-white/90 drop-shadow">{initials}</span>
        </div>
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {mechanic.featured && (
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-fire shadow-sm">Featured</span>
          )}
          {mechanic.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-teal-700 shadow-sm">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/mechanics/${mechanic.slug}`}>
            <h3 className="text-lg font-bold tracking-tight text-slate-950 transition group-hover:text-fire">{mechanic.name}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-4 w-4 text-fire" />
              {mechanic.city}, {mechanic.province}
            </p>
          </Link>
          <div className="flex shrink-0 items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1.5">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <span className="text-sm font-bold text-amber-700">{mechanic.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          {typeof mechanic.reviewCount === "number" && mechanic.reviewCount > 0 && (
            <span>{mechanic.reviewCount} review{mechanic.reviewCount === 1 ? "" : "s"}</span>
          )}
          {mechanic.responseTimeLabel && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {mechanic.responseTimeLabel}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {mechanic.services.slice(0, 3).map((service) => (
            <span key={service} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {service}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-3 pt-6">
          <Link
            href={quoteHref}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-fire px-4 py-2.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
          >
            Get quote <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/mechanics/${mechanic.slug}`}
            className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
