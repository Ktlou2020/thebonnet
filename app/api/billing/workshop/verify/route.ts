import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { SubscriptionTier } from "@prisma/client";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://thebonnet.co.za";

  if (!reference || !secretKey) {
    return NextResponse.redirect(new URL("/pricing?error=invalid", baseUrl));
  }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const data = (await res.json()) as {
    data: {
      status: string;
      metadata: { workshopId?: string; plan?: string };
    };
  };

  if (data.data.status === "success") {
    const { workshopId, plan } = data.data.metadata;
    if (workshopId && plan) {
      const until = new Date();
      until.setMonth(until.getMonth() + 1);
      try {
        await db.workshopSubscription.upsert({
          where: { workshopId },
          create: {
            workshopId,
            tier: plan as SubscriptionTier,
            provider: "paystack",
            startDate: new Date(),
            renewsAt: until,
          },
          update: {
            tier: plan as SubscriptionTier,
            renewsAt: until,
            cancelledAt: null,
          },
        });
        // Also update the workshop's subscriptionTier field
        await db.workshop.update({
          where: { id: workshopId },
          data: { subscriptionTier: plan as SubscriptionTier },
        });
      } catch {
        // If upsert fails (e.g. schema mismatch), continue to redirect
      }
    }
    return NextResponse.redirect(new URL("/dashboard?upgraded=true", baseUrl));
  }

  return NextResponse.redirect(new URL("/pricing?error=payment_failed", baseUrl));
}
