import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await params;
  const body = (await request.json()) as { reason?: string };

  await prisma.workshop.update({
    where: { id },
    data: { isVerified: false, verificationNotes: body.reason ?? null },
  });

  return NextResponse.json({ success: true });
}
