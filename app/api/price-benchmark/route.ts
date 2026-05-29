import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const service = req.nextUrl.searchParams.get("service");
  const city = req.nextUrl.searchParams.get("city");

  if (!service) {
    return NextResponse.json({ error: "Missing service parameter" }, { status: 400 });
  }

  try {
    // Try city-specific first
    let benchmark = city
      ? await db.priceBenchmark.findFirst({
          where: {
            city: { contains: city, mode: "insensitive" },
            category: { name: { contains: service, mode: "insensitive" } },
          },
          include: { category: true },
          orderBy: { sampleSize: "desc" },
        })
      : null;

    // Fall back to national (any city)
    if (!benchmark) {
      benchmark = await db.priceBenchmark.findFirst({
        where: {
          category: { name: { contains: service, mode: "insensitive" } },
        },
        include: { category: true },
        orderBy: { sampleSize: "desc" },
      });
    }

    if (!benchmark) {
      return NextResponse.json({ benchmark: null });
    }

    return NextResponse.json({
      benchmark: {
        low: benchmark.lowCents,
        high: benchmark.highCents,
        currency: "ZAR",
        service: benchmark.category.name,
        city: benchmark.city,
      },
    });
  } catch {
    return NextResponse.json({ benchmark: null });
  }
}
