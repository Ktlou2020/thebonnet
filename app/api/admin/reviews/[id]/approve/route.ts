import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const review = await db.review.update({
    where: { id },
    data: { status: "APPROVED" },
    select: { workshopId: true },
  });

  // Recalculate workshop ratingAverage from all APPROVED reviews
  const agg = await db.review.aggregate({
    where: { workshopId: review.workshopId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { id: true },
  });

  await db.workshop.update({
    where: { id: review.workshopId },
    data: {
      ratingAverage: agg._avg.rating ?? 0,
      reviewCount: agg._count.id,
    },
  });

  return NextResponse.json({ success: true });
}
