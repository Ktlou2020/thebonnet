import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workshopId = req.nextUrl.searchParams.get("workshopId");
  if (!workshopId) return NextResponse.json({ error: "Missing workshopId" }, { status: 400 });

  const profile = await db.profile.findUnique({ where: { email: session.user.email } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const workshop = await db.workshop.findFirst({ where: { id: workshopId, ownerId: profile.id } });
  if (!workshop) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const reviews = await db.$queryRaw<Array<{
    id: string;
    authorName: string;
    rating: number;
    body: string | null;
    jobType: string | null;
    reply: string | null;
    status: string;
    createdAt: Date;
  }>>`
    SELECT id, "authorName", rating, body, "jobType", reply, status, "createdAt"
    FROM reviews
    WHERE "workshopId" = ${workshopId}::uuid
    ORDER BY "createdAt" DESC
  `;

  return NextResponse.json({ reviews });
}
