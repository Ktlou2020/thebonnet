import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { trackServerEvent } from "@/lib/posthog";

export async function POST() {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`billing:${session.user.id}`, 3, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  trackServerEvent(session.user.id ?? "anonymous", "billing_initiated", { plan: "PLUS" });

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: session.user.email,
      amount: 4900, // R49.00 in kobo
      currency: "ZAR",
      metadata: { userId: session.user.id, plan: "PLUS" },
      callback_url: `${process.env.NEXTAUTH_URL}/api/billing/verify`,
    }),
  });

  const data = (await res.json()) as { data?: { authorization_url: string } };
  return NextResponse.json({ authorizationUrl: data.data?.authorization_url });
}
