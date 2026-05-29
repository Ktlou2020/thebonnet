import type { Mechanic } from "@/lib/types";

export function WorkshopSchema({ mechanic }: { mechanic: Mechanic }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: mechanic.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: mechanic.address,
      addressLocality: mechanic.city,
      addressCountry: "ZA",
    },
    ...(mechanic.phone ? { telephone: mechanic.phone } : {}),
    ...(mechanic.website ? { url: mechanic.website } : {}),
    ...(mechanic.reviewCount && mechanic.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: mechanic.rating.toFixed(1),
            reviewCount: mechanic.reviewCount,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
