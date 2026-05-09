import { PriceCard } from "@/components/price-card";
import { SectionHeading } from "@/components/section-heading";
import { priceBenchmarks } from "@/lib/data";

export default function FairPricePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <SectionHeading
        eyebrow="Trust moat"
        title="Fair Price Index"
        description="This section turns pricing transparency into differentiated value. It should eventually be powered by workshop invoices, accepted quotes, and city-level benchmark models."
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {priceBenchmarks.map((item) => (
          <PriceCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
