import { QuoteForm } from "@/components/quote-form";
import { SectionHeading } from "@/components/section-heading";

export default function RequestQuotePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
      <SectionHeading
        eyebrow="Lead capture"
        title="Request a quote from verified mechanics"
        description="This page is built for high-intent lead capture. In production, you would add media uploads, VIN decoding, service matching, and round-robin or auction lead routing."
      />
      <div className="mt-10">
        <QuoteForm />
      </div>
    </div>
  );
}
