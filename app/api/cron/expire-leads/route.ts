import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const leads = await db.lead.findMany({
    where: {
      status: { in: ["NEW", "ASSIGNED"] },
      createdAt: { lt: cutoff },
    },
    select: {
      id: true,
      serviceNeeded: true,
      city: true,
      phone: true,
    },
  });

  if (leads.length === 0) {
    return NextResponse.json({ expired: 0 });
  }

  await db.lead.updateMany({
    where: { id: { in: leads.map((l) => l.id) } },
    data: { status: "EXPIRED" },
  });

  await Promise.allSettled(
    leads.map((lead) =>
      sendWhatsApp({
        to: lead.phone,
        body: `Your quote request for ${lead.serviceNeeded} in ${lead.city ?? "your area"} has expired. Visit https://thebonnet.co.za/request-quote to try again.`,
      })
    )
  );

  return NextResponse.json({ expired: leads.length });
}
