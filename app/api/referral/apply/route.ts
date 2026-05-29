import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { processReferral } from "@/lib/referral";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { referralCode } = (await req.json()) as { referralCode: string };
  if (referralCode) await processReferral(session.user.id, referralCode);
  return NextResponse.json({ ok: true });
}
