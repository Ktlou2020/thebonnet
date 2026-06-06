import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendWhatsApp } from "@/lib/whatsapp";
import { sendQuoteReceivedEmail } from "@/lib/email";

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

  // Mark the assignment as responded
  await db.leadAssignment.update({
    where: { id: body.assignmentId },
    data: { respondedAt: new Date(), status: "QUOTED" },
  });

  // Notify driver if they have a phone
  const lead = assignment.lead;
  if (lead.phone) {
    const amountFormatted = `R${(body.amountCents / 100).toLocaleString("en-ZA")}`;
    const workshopName = body.workshopName ?? assignment.workshop.name;
    await sendWhatsApp({
      to: lead.phone,
      body: `🔧 You have a new quote from ${workshopName} on My Bonnet!\n\nAmount: ${amountFormatted}\n\nView it: https://thebonnet.co.za/quotes`,
    }).catch(() => null);
  }

  // Email notification to driver
  try {
    if (lead.email) {
      await sendQuoteReceivedEmail(lead.email, {
        workshopName: body.workshopName ?? assignment.workshop.name,
        amountRands: Math.round(body.amountCents / 100),
        service: lead.serviceNeeded,
        quotesUrl: `${process.env.NEXTAUTH_URL ?? "https://thebonnet.co.za"}/quotes`,
      });
    }
  } catch {
    // Don't fail the request if email fails
  }

  return NextResponse.json({ ok: true, quote });
}
