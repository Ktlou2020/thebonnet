import { QuoteForm } from "@/components/quote-form";
import { SectionHeading } from "@/components/section-heading";
import { getCityHighlights, getServiceCategories } from "@/lib/workshops";

export default async function RequestQuotePage({
  searchParams
}: {
  searchParams?: Promise<{ city?: string; service?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const cityHighlights = await getCityHighlights();
  const serviceCategories = await getServiceCategories();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
      <SectionHeading eyebrow="Request quotes" title="Tell us about your car and the work you need" description="This form captures the lead in Postgres when the Railway database is connected and prepares the request for routing to matching workshops by city and service type." />
      <div className="mt-10">
        <QuoteForm cityOptions={cityHighlights.map((item) => item.city)} serviceOptions={serviceCategories} initialCity={typeof params.city === "string" ? params.city : undefined} initialService={typeof params.service === "string" ? params.service : undefined} />
      </div>
    </div>
  );
}
