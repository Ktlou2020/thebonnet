import { QuoteWizard } from "@/components/quote-wizard";
import { getCityHighlights, getServiceCategories } from "@/lib/workshops";

export const dynamic = "force-dynamic";

export default async function RequestQuotePage({
  searchParams,
}: {
  searchParams?: Promise<{ city?: string; service?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const [cityHighlights, serviceCategories] = await Promise.all([getCityHighlights(), getServiceCategories()]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ink px-6 py-12 text-white lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Get free quotes from trusted workshops</h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Tell us what you need once. We&apos;ll route your request to matching workshops near you so the quotes come to you.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
        <QuoteWizard
          cityOptions={cityHighlights.map((c) => c.city)}
          serviceOptions={serviceCategories}
          initialCity={typeof params.city === "string" ? params.city : undefined}
          initialService={typeof params.service === "string" ? params.service : undefined}
        />
      </div>
    </div>
  );
}
