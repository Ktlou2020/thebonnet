import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { GarageVehicle, GarageServiceRecord } from "@/lib/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vehicles, serviceRecords } = (await req.json()) as {
    vehicles: GarageVehicle[];
    serviceRecords: GarageServiceRecord[];
  };

  const profile = await db.profile.findUnique({ where: { id: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const idMap: Record<string, string> = {};
  let vehicleCount = 0;
  let recordCount = 0;

  for (const v of vehicles ?? []) {
    const created = await db.vehicle.create({
      data: {
        profileId: profile.id,
        make: v.make,
        model: v.model,
        year: v.year,
        variant: v.variant ?? null,
        colour: v.colour ?? null,
        nickname: v.nickname ?? null,
        registrationNo: v.registrationNo ?? null,
        currentMileage: v.currentMileage ?? null,
        notes: v.notes ?? null,
      },
    });
    idMap[v.id] = created.id;
    vehicleCount++;
  }

  for (const r of serviceRecords ?? []) {
    const vehicleId = idMap[r.vehicleId];
    if (!vehicleId) continue;
    await db.serviceRecord.create({
      data: {
        vehicleId,
        serviceType: r.serviceType,
        date: new Date(r.date),
        mileageAtService: r.mileageAtService ?? null,
        workshopName: r.workshopName ?? null,
        city: r.city ?? null,
        totalCostCents: r.totalCostCents ?? null,
        labourCents: r.labourCents ?? null,
        partsCents: r.partsCents ?? null,
        notes: r.notes ?? null,
      },
    });
    recordCount++;
  }

  return NextResponse.json({ ok: true, vehicleCount, recordCount });
}
