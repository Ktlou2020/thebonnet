import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const quote = await db.quote.findUnique({
    where: { id },
    include: { assignment: { include: { lead: true } } },
  });

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  await db.quote.update({
    where: { id },
    data: { status: "ACCEPTED" },
  });

  await db.$executeRaw`UPDATE quotes SET "isAccepted" = true WHERE id = ${id}::uuid`;
  await db.$executeRaw`UPDATE leads SET status = 'ACCEPTED' WHERE id = ${quote.assignment.leadId}::uuid`;

  return NextResponse.json({ ok: true });
}
