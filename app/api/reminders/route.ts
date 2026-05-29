import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

type ReminderRow = {
  id: string;
  vehicleId: string;
  profileId: string;
  reminderType: string;
  dueDate: Date;
  dueMileage: number | null;
  sent: boolean;
  sentAt: Date | null;
  createdAt: Date;
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.profile.findUnique({ where: { email: session.user.email } });
  if (!profile) return NextResponse.json({ reminders: [] });

  try {
    const reminders = await db.$queryRaw<ReminderRow[]>`
      SELECT id, "vehicleId", "profileId", "reminderType", "dueDate", "dueMileage", sent, "sentAt", "createdAt"
      FROM maintenance_reminders
      WHERE "profileId" = ${profile.id}::uuid
      ORDER BY "dueDate" ASC
    `;
    return NextResponse.json({ reminders });
  } catch {
    return NextResponse.json({ reminders: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    vehicleId: string;
    reminderType: string;
    dueDate: string;
    dueMileage?: number;
  };

  if (!body.vehicleId || !body.reminderType || !body.dueDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const profile = await db.profile.findUnique({ where: { email: session.user.email } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  try {
    const id = crypto.randomUUID();
    const dueDate = new Date(body.dueDate);
    const dueMileage = body.dueMileage ?? null;

    await db.$executeRaw`
      INSERT INTO maintenance_reminders (id, "profileId", "vehicleId", "reminderType", "dueDate", "dueMileage", sent, "createdAt")
      VALUES (${id}::uuid, ${profile.id}::uuid, ${body.vehicleId}::uuid, ${body.reminderType}, ${dueDate}, ${dueMileage}, false, now())
    `;

    const reminder: ReminderRow = {
      id,
      vehicleId: body.vehicleId,
      profileId: profile.id,
      reminderType: body.reminderType,
      dueDate,
      dueMileage: dueMileage,
      sent: false,
      sentAt: null,
      createdAt: new Date(),
    };

    return NextResponse.json({ ok: true, reminder });
  } catch {
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}
