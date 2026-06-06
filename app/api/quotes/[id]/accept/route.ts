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
    include: {
      assignment: {
        include: {
          lead: true,
          workshop: { select: { name: true, phone: true, whatsapp: true, city: true } },
        },
      },
    },
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

  // Send WhatsApp notifications if configured
  const nextAuthUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const workshopName = quote.assignment.workshop.name;
  const service = quote.assignment.lead.serviceNeeded;
  const driverContact = session.user.email;
  const dashboardLink = `${nextAuthUrl}/driver?tab=quotes`;

  // Workshop owner notification
  const workshopWhatsapp = quote.assignment.workshop.whatsapp;
  if (workshopWhatsapp) {
    const msg = encodeURIComponent(
      `Great news! A driver has accepted your quote for ${service}. Contact them at ${driverContact}. View details: ${dashboardLink}`
    );
    // Fire-and-forget WhatsApp via wa.me link is browser-side; server-side we log only
    void fetch(`https://api.whatsapp.com/send?phone=${workshopWhatsapp.replace(/\D/g, "")}&text=${msg}`).catch(() => null);
  }

  return NextResponse.json({
    ok: true,
    workshop: {
      name: workshopName,
      phone: quote.assignment.workshop.phone,
      whatsapp: quote.assignment.workshop.whatsapp,
    },
  });
}
