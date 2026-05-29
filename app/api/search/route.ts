import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const workshops = await db.workshop.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      city: true,
      slug: true,
      services: { select: { category: { select: { name: true } } }, take: 1 },
    },
    take: 8,
  });

  return NextResponse.json({
    results: workshops.map((w) => ({
      id: w.id,
      name: w.name,
      city: w.city,
      slug: w.slug,
      service: w.services[0]?.category.name ?? "",
    })),
  });
}
