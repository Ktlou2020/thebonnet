import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const PLAN_AMOUNTS: Record<string, number> = {
  GROWTH: 79900,
  PRO: 149900,
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return NextResponse.json({ error: "Billing not configured" }, { status: 503 });

  const { plan } = (await req.json()) as { plan: string };
  const amount = PLAN_AMOUNTS[plan];
  if (!amount) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const workshop = await db.workshop.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true },
  });

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: session.user.email,
      amount,
      currency: "ZAR",
      metadata: {
        userId: session.user.id,
        workshopId: workshop?.id,
        plan,
        type: "workshop_subscription",
      },
      callback_url: `${process.env.NEXTAUTH_URL ?? "https://thebonnet.co.za"}/api/billing/workshop/verify`,
    }),
  });

  const data = (await res.json()) as { data: { authorization_url: string } };
  return NextResponse.json({ authorizationUrl: data.data.authorization_url });
}
