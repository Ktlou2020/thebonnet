import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const profile = await db.profile.findUnique({ where: { email: session.user.email } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const quote = await db.quote.findFirst({
    where: { id, assignment: { lead: { email: session.user.email } } },
  });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.quote.update({ where: { id }, data: { status: "REJECTED" } });
  return NextResponse.json({ ok: true });
}
