import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    assignmentId: string;
    leadId: string;
    amountCents: number;
    message?: string;
    workshopName?: string;
  };

  if (!body.assignmentId || !body.leadId || !body.amountCents) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify ownership
  const profile = await db.profile.findUnique({ where: { email: session.user.email } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const assignment = await db.leadAssignment.findUnique({
    where: { id: body.assignmentId },
    include: { workshop: true, lead: true },
  });

  if (!assignment || assignment.workshop.ownerId !== profile.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const quote = await db.quote.create({
    data: {
      assignmentId: body.assignmentId,
      labourCents: body.amountCents,
      partsCents: 0,
      totalCents: body.amountCents,
      status: "SUBMITTED",
    },
  });

  if (body.message) {
    await db.$executeRaw`UPDATE quotes SET "workshopMessage" = ${body.message} WHERE id = ${quote.id}::uuid`;
  }

  await db.$executeRaw`UPDATE leads SET status = 'RESPONDED' WHERE id = ${body.leadId}::uuid`;

  // Notify driver if they have a phone
  const lead = assignment.lead;
  if (lead.phone) {
    const amountFormatted = `R${(body.amountCents / 100).toLocaleString("en-ZA")}`;
    const workshopName = body.workshopName ?? assignment.workshop.name;
    await sendWhatsApp({
      to: lead.phone,
      body: `🔧 You have a new quote from ${workshopName} on The Bonnet!\n\nAmount: ${amountFormatted}\n\nView it: https://thebonnet.co.za/quotes`,
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true, quote });
}
