import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ totalXp: 0 });
  }
  try {
    const profile = await db.profile.findUnique({
      where: { email: session.user.email },
      select: { xp: { select: { totalXp: true } } },
    });
    return NextResponse.json({ totalXp: profile?.xp?.totalXp ?? 0 });
  } catch {
    return NextResponse.json({ totalXp: 0 });
  }
}
