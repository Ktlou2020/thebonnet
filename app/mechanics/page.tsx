import Link from "next/link";
import { WorkshopCard } from "@/components/workshop-card";
import { DiscoveryFilters } from "@/components/discovery-filters";
import { getDirectoryPageData } from "@/lib/workshops";

export const dynamic = "force-dynamic";

export default async function MechanicsPage({
  searchParams,
}: {
  searchParams?: Promise<{ city?: string; service?: string; rating?: string; verified?: string; sort?: string; mobile?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const selectedCity = typeof params.city === "string" ? params.city : null;
  const selectedService = typeof params.service === "string" ? params.service : null;
  const minRating = params.rating ? parseFloat(params.rating) : null;
  const verifiedOnly = params.verified === "1";
  const sort = params.sort ?? "featured";
  const mobileOnly = params.mobile === "1";

  const { filteredMechanics, cityHighlights, serviceCategories } = await getDirectoryPageData({
    city: selectedCity,
    service: selectedService,
    mobileOnly,
  });

  let results = filteredMechanics;
  if (minRating !== null) results = results.filter((m) => m.rating >= minRating);
  if (verifiedOnly) results = results.filter((m) => m.isVerified);

  results = [...results].sort((a, b) => {
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "reviews") return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
    if (sort === "name") return a.name.localeCompare(b.name);
    return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ink px-6 py-12 text-white lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Find your mechanic</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            Browse verified workshops across South Africa. Filter by city, service, and rating to find the right fit.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <DiscoveryFilters
              cities={cityHighlights.map((c) => ({ city: c.city, count: c.count }))}
              services={serviceCategories}
            />
          </div>

          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-950">
                {results.length} workshop{results.length === 1 ? "" : "s"} found
                {selectedCity ? ` in ${selectedCity}` : ""}
              </h2>
            </div>

            {results.length ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((mechanic) => <WorkshopCard key={mechanic.slug} mechanic={mechanic} />)}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-soft">
                <div className="text-5xl">🔍</div>
                <h3 className="mt-4 text-xl font-semibold text-slate-950">No workshops matched those filters</h3>
                <p className="mt-2 text-sm text-slate-600">Try clearing a filter or request a quote and we&apos;ll match you manually.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href="/mechanics" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">Clear filters</Link>
                  <Link href="/request-quote" className="rounded-full bg-fire px-5 py-2.5 text-sm font-semibold text-white shadow-glow-fire">Request quotes</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
