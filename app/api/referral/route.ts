import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrCreateReferralCode } from "@/lib/referral";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const code = await getOrCreateReferralCode(session.user.id);
  const count = await db.referral.count({ where: { referrerId: session.user.id } });
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://thebonnet.co.za";

  return NextResponse.json({ code, count, shareUrl: `${baseUrl}/signup?ref=${code}` });
}
