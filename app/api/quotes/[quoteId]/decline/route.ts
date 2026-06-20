import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { quoteId } = await params;
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    include: { assignment: { include: { lead: true } } },
  });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify ownership by checking the lead's profile email matches
  const profile = await db.profile.findUnique({ where: { email: session.user.email } });
  if (!profile || (quote.assignment.lead.customerId !== profile.id && quote.assignment.lead.email !== session.user.email)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.quote.update({ where: { id: quoteId }, data: { status: "REJECTED" } });
  return NextResponse.json({ ok: true });
}
