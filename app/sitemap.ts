import type { MetadataRoute } from "next";
import { getMechanics } from "@/lib/workshops";

const SA_CITIES = [
  "Cape Town",
  "Johannesburg",
  "Pretoria",
  "Durban",
  "Gqeberha",
  "East London",
  "Bloemfontein",
  "Nelspruit",
  "Polokwane",
  "Kimberley",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const mechanics = await getMechanics();

  return [
    { url: siteUrl, priority: 1, changeFrequency: "daily" },
    { url: `${siteUrl}/mechanics`, priority: 0.9, changeFrequency: "daily" },
    { url: `${siteUrl}/request-quote`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${siteUrl}/fair-price`, priority: 0.7, changeFrequency: "weekly" },
    { url: `${siteUrl}/for-mechanics`, priority: 0.7, changeFrequency: "weekly" },
    { url: `${siteUrl}/pricing`, priority: 0.7, changeFrequency: "weekly" },
    ...SA_CITIES.map((city) => ({
      url: `${siteUrl}/mechanics/city/${city.toLowerCase().replace(/\s+/g, "-")}`,
      priority: 0.8,
      changeFrequency: "weekly" as const,
    })),
    ...mechanics.map((mechanic) => ({ url: `${siteUrl}/mechanics/${mechanic.slug}`, priority: 0.8, changeFrequency: "weekly" as const })),
  ];
}
