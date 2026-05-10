import type { MetadataRoute } from "next";
import { getMechanics } from "@/lib/workshops";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const mechanics = await getMechanics();

  return [
    { url: siteUrl, priority: 1, changeFrequency: "daily" },
    { url: `${siteUrl}/mechanics`, priority: 0.9, changeFrequency: "daily" },
    { url: `${siteUrl}/request-quote`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${siteUrl}/fair-price`, priority: 0.7, changeFrequency: "weekly" },
    { url: `${siteUrl}/for-mechanics`, priority: 0.7, changeFrequency: "weekly" },
    ...mechanics.map((mechanic) => ({ url: `${siteUrl}/mechanics/${mechanic.slug}`, priority: 0.8, changeFrequency: "weekly" as const }))
  ];
}
