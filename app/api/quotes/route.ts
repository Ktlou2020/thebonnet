import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.profile.findUnique({ where: { email: session.user.email } });
  if (!profile) {
    return NextResponse.json({ leads: [] });
  }

  const leads = await db.lead.findMany({
    where: {
      OR: [
        { customerId: profile.id },
        { email: session.user.email },
      ],
    },
    include: {
      assignments: {
        include: {
          quote: true,
          workshop: { select: { id: true, name: true, slug: true, city: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ leads });
}
