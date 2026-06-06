import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { sendQuoteNotificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const payload = await request.json();
  const prisma = getPrisma();

  const leadData = {
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    location: payload.location,
    city: payload.city ?? null,
    province: payload.province ?? null,
    vehicleMake: payload.vehicleMake ?? null,
    vehicleModel: payload.vehicleModel ?? null,
    vehicleYear: payload.vehicleYear ? Number(payload.vehicleYear) : null,
    vehicleLabel: payload.vehicle ?? payload.vehicleLabel ?? "Vehicle not specified",
    serviceNeeded: payload.serviceNeeded,
    urgency: payload.urgency ?? null,
    details: payload.details ?? null
  };

  if (!prisma) {
    return NextResponse.json({
      ok: true,
      persisted: false,
      message: "Your request has been received in preview mode. Connect the production database to persist quote requests automatically.",
      lead: leadData
    });
  }

  const lead = await prisma.lead.create({ data: leadData });

  // Find up to 5 verified workshops in the same city
  if (lead.city) {
    let workshops = lead.serviceNeeded
      ? await prisma.workshop.findMany({
          where: {
            status: "VERIFIED",
            city: lead.city,
            listingTypes: { hasSome: [lead.serviceNeeded] },
          },
          select: { id: true, name: true, email: true, owner: { select: { email: true } } },
          take: 5,
        })
      : [];

    // Fallback to city-only if no matches
    if (workshops.length === 0) {
      workshops = await prisma.workshop.findMany({
        where: { status: "VERIFIED", city: lead.city },
        select: { id: true, name: true, email: true, owner: { select: { email: true } } },
        take: 5,
      });
    }

    if (workshops.length > 0) {
      await prisma.leadAssignment.createMany({
        data: workshops.map((w) => ({ leadId: lead.id, workshopId: w.id })),
        skipDuplicates: true,
      });

      // Send notifications — failures must not break the response
      try {
        const dashboardUrl = `${process.env.NEXTAUTH_URL ?? "https://thebonnet.co.za"}/dashboard`;
        await Promise.all(
          workshops.map((w) => {
            const recipientEmail = w.owner?.email ?? w.email;
            if (!recipientEmail) return Promise.resolve();
            return sendQuoteNotificationEmail(recipientEmail, {
              workshopName: w.name,
              service: lead.serviceNeeded,
              city: lead.city!,
              dashboardUrl,
            }).catch(() => null);
          })
        );
      } catch {
        // Email failures should not break the response
      }
    }
  }

  return NextResponse.json({
    ok: true,
    persisted: true,
    message: `Lead saved to Railway PostgreSQL for ${lead.vehicleLabel} in ${lead.location}.`,
    id: lead.id
  });
}
