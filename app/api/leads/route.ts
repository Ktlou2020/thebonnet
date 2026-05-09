import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

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
      message:
        "Lead captured in demo mode. Add Supabase DATABASE_URL and DIRECT_URL to persist leads to Postgres.",
      lead: leadData
    });
  }

  const lead = await prisma.lead.create({
    data: leadData
  });

  return NextResponse.json({
    ok: true,
    persisted: true,
    message: `Lead saved to Supabase for ${lead.vehicleLabel} in ${lead.location}.`,
    id: lead.id
  });
}
