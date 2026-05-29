import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json()) as { reply: string };

  if (!body.reply?.trim()) {
    return NextResponse.json({ error: "Reply cannot be empty" }, { status: 400 });
  }

  // Verify workshop ownership
  const profile = await db.profile.findUnique({ where: { email: session.user.email } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const review = await db.review.findUnique({
    where: { id },
    include: { workshop: true },
  });

  if (!review || review.workshop.ownerId !== profile.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const replyText = body.reply.trim();
  const repliedAt = new Date();
  await db.$executeRaw`UPDATE reviews SET reply = ${replyText}, "repliedAt" = ${repliedAt} WHERE id = ${id}::uuid`;

  return NextResponse.json({ ok: true });
}
