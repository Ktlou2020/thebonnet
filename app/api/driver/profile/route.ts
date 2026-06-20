import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { fullName?: string; phone?: string; city?: string };

  await db.profile.update({
    where: { email: session.user.email },
    data: {
      fullName: body.fullName ?? undefined,
      phone: body.phone ?? undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
