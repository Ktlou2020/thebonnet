import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.profile.findUnique({ where: { email: session.user.email } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const workshop = await db.workshop.findFirst({
    where: { ownerId: profile.id },
    select: {
      id: true,
      subscription: {
        select: { tier: true, renewsAt: true },
      },
    },
  });

  if (!workshop) {
    return NextResponse.json({ error: "No workshop found" }, { status: 404 });
  }

  if (!workshop.subscription) {
    return NextResponse.json({ plan: "FREE", renewsAt: null });
  }

  return NextResponse.json({
    plan: workshop.subscription.tier,
    renewsAt: workshop.subscription.renewsAt?.toISOString() ?? null,
  });
}
