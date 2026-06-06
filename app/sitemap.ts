import { db } from "@/lib/db";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL ?? "https://thebonnet.co.za";
  const workshops = await db.workshop.findMany({
    where: { status: "VERIFIED" },
    select: { slug: true, updatedAt: true },
  });
  const staticPages = ["/", "/mechanics", "/pricing", "/about", "/terms", "/privacy"].map(url => ({
    url: `${base}${url}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: url === "/" ? 1 : 0.8,
  }));
  const workshopPages = workshops.map(w => ({
    url: `${base}/mechanics/${w.slug}`,
    lastModified: w.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  return [...staticPages, ...workshopPages];
}
