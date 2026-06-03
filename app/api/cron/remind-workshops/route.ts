import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const from = new Date(now - 28 * 60 * 60 * 1000);
  const to = new Date(now - 20 * 60 * 60 * 1000);

  // Leads created 20-28h ago with status NEW and no assignments with quotes
  const leads = await db.lead.findMany({
    where: {
      status: "NEW",
      createdAt: { gte: from, lte: to },
    },
    select: {
      id: true,
      assignments: {
        select: {
          workshopId: true,
          status: true,
          workshop: {
            select: {
              owner: {
                select: { phone: true },
              },
            },
          },
        },
      },
    },
  });

  let reminded = 0;

  for (const lead of leads) {
    // Check if any assignment has a quote
    const hasQuote = lead.assignments.some(
      (a) => a.status === "QUOTED" || a.status === "WON"
    );
    if (hasQuote) continue;

    // Send reminder to workshop owners who haven't responded
    const unrespondedOwners = lead.assignments.filter(
      (a) => a.status === "SENT" || a.status === "VIEWED"
    );

    for (const assignment of unrespondedOwners) {
      const phone = assignment.workshop.owner.phone;
      if (phone) {
        await sendWhatsApp({
          to: phone,
          body: "Reminder: You have an unanswered quote request. Visit https://thebonnet.co.za/dashboard to respond.",
        });
        reminded++;
      }
    }
  }

  return NextResponse.json({ reminded });
}
