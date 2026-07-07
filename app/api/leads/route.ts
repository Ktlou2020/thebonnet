import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getPrisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { sendQuoteNotificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  // Rate limit: 5 quote requests per 10 minutes per IP
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`leads:${ip}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Required field validation
  const fullName = typeof payload.fullName === "string" ? payload.fullName.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const city = typeof payload.city === "string" ? payload.city.trim() : "";
  const serviceNeeded = typeof payload.serviceNeeded === "string" ? payload.serviceNeeded.trim() : "";
  const vehicle = typeof payload.vehicle === "string" ? payload.vehicle.trim() : (typeof payload.vehicleLabel === "string" ? payload.vehicleLabel.trim() : "");

  const missing: string[] = [];
  if (!fullName) missing.push("fullName");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) missing.push("email");
  if (!phone) missing.push("phone");
  if (!serviceNeeded) missing.push("serviceNeeded");

  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing or invalid fields: ${missing.join(", ")}` }, { status: 400 });
  }

  const leadData = {
    fullName,
    email,
    phone,
    location: typeof payload.location === "string" ? payload.location.trim() : "",
    city: city || null,
    province: typeof payload.province === "string" ? payload.province.trim() : null,
    vehicleMake: typeof payload.vehicleMake === "string" ? payload.vehicleMake.trim() : null,
    vehicleModel: typeof payload.vehicleModel === "string" ? payload.vehicleModel.trim() : null,
    vehicleYear: payload.vehicleYear ? Number(payload.vehicleYear) : null,
    vehicleLabel: vehicle || "Vehicle not specified",
    serviceNeeded,
    urgency: typeof payload.urgency === "string" ? payload.urgency.trim() : null,
    details: typeof payload.details === "string" ? payload.details.trim() : null,
  };

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({
      ok: true,
      persisted: false,
      message: "Your request has been received. We'll be in touch shortly.",
      lead: leadData,
    });
  }

  const lead = await prisma.lead.create({ data: leadData });

  // Match to verified workshops in the same city
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
        // Email failures must not break the response
      }
    }
  }

  return NextResponse.json({
    ok: true,
    persisted: true,
    message: "Your quote request is on its way. Workshops will respond within 2 hours.",
    id: lead.id,
  });
}
