import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const workshops = await prisma.workshop.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      isVerified: true,
      createdAt: true,
      subscription: {
        select: { tier: true },
      },
      _count: {
        select: { reviews: true, leadAssignments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = workshops.map((w) => ({
    id: w.id,
    name: w.name,
    slug: w.slug,
    city: w.city,
    isVerified: w.isVerified,
    subscriptionPlan: w.subscription?.tier ?? null,
    createdAt: w.createdAt,
    reviewCount: w._count.reviews,
    leadCount: w._count.leadAssignments,
  }));

  return NextResponse.json(result);
}
