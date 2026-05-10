import Link from "next/link";
import { MechanicCard } from "@/components/mechanic-card";
import { SectionHeading } from "@/components/section-heading";
import { getDirectoryPageData } from "@/lib/workshops";

export default async function MechanicsPage({
  searchParams
}: {
  searchParams?: Promise<{ city?: string; service?: string; mobile?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const selectedCity = typeof params.city === "string" ? params.city : null;
  const selectedService = typeof params.service === "string" ? params.service : null;
  const mobileOnly = params.mobile === "1";
  const { filteredMechanics, cityHighlights, serviceCategories } = await getDirectoryPageData({
    city: selectedCity,
    service: selectedService,
    mobileOnly
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <SectionHeading eyebrow="Mechanic directory" title="Browse mechanics by city, service type, and mobile support" description="These launch listings are sourced from public workshop information and organised into a cleaner client-facing marketplace for South African drivers." />

      <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm leading-7 text-slate-600">Use the filters below to narrow the directory, or jump straight to the quote form if you want help matching the right workshop.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCity ? <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">City: {selectedCity}</span> : null}
              {selectedService ? <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">Service: {selectedService}</span> : null}
              {mobileOnly ? <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">Mobile only</span> : null}
              {selectedCity || selectedService || mobileOnly ? <Link href="/mechanics" className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">Clear filters</Link> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={mobileOnly ? "/mechanics" : `/mechanics?${new URLSearchParams({ ...(selectedCity ? { city: selectedCity } : {}), ...(selectedService ? { service: selectedService } : {}), mobile: "1" }).toString()}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
              {mobileOnly ? "Show all workshops" : "Mobile mechanics only"}
            </Link>
            <Link href={`/request-quote${selectedCity || selectedService ? `?${new URLSearchParams({ ...(selectedCity ? { city: selectedCity } : {}), ...(selectedService ? { service: selectedService } : {}) }).toString()}` : ""}`} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
              Request quotes
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Cities</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {cityHighlights.map((item) => (
              <Link key={item.city} href={`/mechanics?${new URLSearchParams({ ...(selectedService ? { service: selectedService } : {}), ...(mobileOnly ? { mobile: "1" } : {}), city: item.city }).toString()}`} className={`rounded-full px-3 py-1 text-xs font-medium transition ${selectedCity === item.city ? "bg-ink text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                {item.city} · {item.count}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Services</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {serviceCategories.map((service) => (
              <Link key={service} href={`/mechanics?${new URLSearchParams({ ...(selectedCity ? { city: selectedCity } : {}), ...(mobileOnly ? { mobile: "1" } : {}), service }).toString()}`} className={`rounded-full border px-3 py-1 text-xs transition ${selectedService === service ? "border-ink bg-ink text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                {service}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">{filteredMechanics.length} workshops found</h2>
          <p className="mt-1 text-sm text-slate-500">Public launch listings with customer-facing contact options.</p>
        </div>
      </div>

      {filteredMechanics.length ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredMechanics.map((mechanic) => <MechanicCard key={mechanic.slug} mechanic={mechanic} />)}
        </div>
      ) : (
        <div className="mt-8 rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-soft">
          <h3 className="text-xl font-semibold text-slate-950">No workshops matched those filters</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">Try clearing one of the filters or send a quote request so the platform can help you find a workshop manually.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/mechanics" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Reset directory</Link>
            <Link href="/request-quote" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Request quotes</Link>
          </div>
        </div>
      )}
    </div>
  );
}
