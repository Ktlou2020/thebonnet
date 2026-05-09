import { notFound } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, Clock3, MapPin, PhoneCall, ShieldCheck } from "lucide-react";
import { mechanics } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function MechanicDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mechanic = mechanics.find((item) => item.slug === slug);

  if (!mechanic) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <div className="flex flex-wrap items-center gap-3">
            {mechanic.badges.map((badge) => (
              <span key={badge} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{badge}</span>
            ))}
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">{mechanic.name}</h1>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> {mechanic.city}, {mechanic.province}</div>
            <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-accent" /> Responds in {mechanic.responseTime}</div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> {mechanic.accreditations.join(", ")}</div>
            <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-accent" /> {mechanic.warranty}</div>
          </div>
          <p className="mt-6 text-base leading-8 text-slate-600">{mechanic.about}</p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-950">What this listing proves</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <li>• Manual workshop review rather than scraped junk data</li>
                <li>• Brand and service specialization for better matching</li>
                <li>• Lead monetization readiness via plan tier: {mechanic.leadPlan}</li>
                <li>• Price and response transparency baked into ranking logic</li>
              </ul>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-950">Supported makes</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {mechanic.makes.map((make) => (
                  <span key={make} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">{make}</span>
                ))}
              </div>
              <h2 className="mt-6 text-lg font-semibold text-slate-950">Services</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {mechanic.services.map((service) => (
                  <span key={service} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">{service}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-accent">Commercial profile</p>
            <div className="mt-3 text-4xl font-semibold text-slate-950">{formatCurrency(mechanic.hourlyRate)}/hr</div>
            <p className="mt-3 text-sm leading-7 text-slate-600">This card is ready for ranking multipliers, premium boosts, lead billing, and conversion reporting.</p>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div>Plan tier: <span className="font-semibold text-slate-950">{mechanic.leadPlan}</span></div>
              <div>Mobile service: <span className="font-semibold text-slate-950">{mechanic.mobile ? "Yes" : "Workshop only"}</span></div>
              <div>Service radius: <span className="font-semibold text-slate-950">{mechanic.serviceRadiusKm} km</span></div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/request-quote" className="rounded-full bg-ink px-4 py-3 text-center text-sm font-semibold text-white">Request quote</Link>
              <a href={`https://wa.me/${mechanic.whatsapp.replace(/[^\d]/g, "")}`} className="rounded-full border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700">
                <PhoneCall className="mr-2 inline-flex h-4 w-4" /> WhatsApp lead
              </a>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-slate-950">Why this matters for the platform</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Detailed listings reduce trust friction, improve SEO, and let you charge mechanics for premium visibility without looking like a thin lead-gen site.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
