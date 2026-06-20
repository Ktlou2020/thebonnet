import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { awardXp } from "@/lib/award-xp";
import { DRIVER_XP_ACTIONS } from "@/lib/gamification";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    name?: string;
    city?: string;
    province?: string;
    phone?: string;
    website?: string;
    note?: string;
  };

  if (!body.name || !body.city) {
    return NextResponse.json({ error: "Workshop name and city are required." }, { status: 400 });
  }

  const session = await auth();
  let profileId: string | null = null;
  if (session?.user?.email) {
    const profile = await db.profile.findUnique({ where: { email: session.user.email } });
    profileId = profile?.id ?? null;
  }

  // The nomination needs an owner profile; fall back to the nominator if present.
  if (!profileId) {
    return NextResponse.json(
      { ok: true, message: "Thanks for the recommendation! Sign in to earn XP for nominations." },
      { status: 200 }
    );
  }

  const baseSlug = slugify(body.name) || "workshop";
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

  try {
    await db.workshop.create({
      data: {
        ownerId: profileId,
        name: body.name,
        slug,
        description: body.note ?? `Recommended by a My Bonnet driver.`,
        city: body.city,
        province: body.province ?? "",
        phone: body.phone ?? null,
        website: body.website ?? null,
        status: "PENDING",
        sourceName: "Driver recommendation",
      },
    });

    await awardXp(profileId, DRIVER_XP_ACTIONS.REFERRAL_SENT);
  } catch {
    return NextResponse.json({ error: "Could not save recommendation." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: `Thanks! ${body.name} has been submitted for review. You earned ${DRIVER_XP_ACTIONS.REFERRAL_SENT} XP.` });
}
