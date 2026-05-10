import { PriceCard } from "@/components/price-card";
import { SectionHeading } from "@/components/section-heading";
import { priceBenchmarks } from "@/lib/workshops";

export default function FairPricePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <SectionHeading eyebrow="Pricing beta" title="Fair Price Index is growing carefully" description="The Bonnet should only publish pricing where there is enough evidence. This page starts with a sourced benchmark and will expand as accepted quotes and workshop invoice data grow." />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {priceBenchmarks.map((item) => <PriceCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
