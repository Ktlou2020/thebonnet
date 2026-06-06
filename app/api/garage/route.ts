import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.profile.findUnique({ where: { email: session.user.email } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const vehicles = await db.vehicle.findMany({
    where: { profileId: profile.id, isArchived: false },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ vehicles });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.profile.findUnique({ where: { email: session.user.email } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const body = (await req.json()) as {
    make: string;
    model: string;
    year: number;
    variant?: string;
    colour?: string;
    nickname?: string;
    registrationNo?: string;
    currentMileage?: number;
  };

  if (!body.make || !body.model || !body.year) {
    return NextResponse.json({ error: "make, model and year are required" }, { status: 400 });
  }

  const vehicle = await db.vehicle.create({
    data: {
      profileId: profile.id,
      make: body.make,
      model: body.model,
      year: body.year,
      variant: body.variant ?? null,
      colour: body.colour ?? null,
      nickname: body.nickname ?? null,
      registrationNo: body.registrationNo ?? null,
      currentMileage: body.currentMileage ?? null,
    },
  });

  return NextResponse.json({ vehicle }, { status: 201 });
}
