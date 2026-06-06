import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workshopId = req.nextUrl.searchParams.get("workshopId");
  if (!workshopId) {
    return NextResponse.json({ error: "Missing workshopId" }, { status: 400 });
  }

  // Verify workshop ownership
  const profile = await db.profile.findUnique({ where: { email: session.user.email } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const workshop = await db.workshop.findFirst({
    where: { id: workshopId, ownerId: profile.id },
  });
  if (!workshop) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const assignments = await db.leadAssignment.findMany({
    where: { workshopId },
    include: {
      quote: true,
      lead: true,
    },
    orderBy: { assignedAt: "desc" },
  });

  // Mark unviewed assignments as viewed
  const unviewedIds = assignments
    .filter((a) => a.viewedAt === null)
    .map((a) => a.id);

  if (unviewedIds.length > 0) {
    await db.leadAssignment.updateMany({
      where: { id: { in: unviewedIds } },
      data: { viewedAt: new Date() },
    });
  }

  return NextResponse.json({ assignments });
}
