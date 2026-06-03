import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    workshopId: string;
    name: string;
    phone?: string;
    city: string;
    description?: string;
    imageUrl?: string;
    openingHours?: Record<string, string | null>;
  };

  const profile = await db.profile.findUnique({ where: { email: session.user.email } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const workshop = await db.workshop.findFirst({ where: { id: body.workshopId, ownerId: profile.id } });
  if (!workshop) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  await db.workshop.update({
    where: { id: body.workshopId },
    data: {
      name: body.name,
      phone: body.phone ?? null,
      city: body.city,
      description: body.description ?? workshop.description,
      ...(body.openingHours !== undefined ? { openingHours: body.openingHours } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
