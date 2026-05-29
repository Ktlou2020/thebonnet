import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.redirect(new URL("/pricing?error=missing_reference", process.env.NEXTAUTH_URL ?? req.nextUrl.origin));
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return NextResponse.redirect(new URL("/pricing?error=not_configured", process.env.NEXTAUTH_URL ?? req.nextUrl.origin));
  }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });

  const data = (await res.json()) as {
    data?: {
      status: string;
      metadata?: { userId?: string; plan?: string };
    };
  };

  if (data.data?.status === "success") {
    const userId = data.data.metadata?.userId;
    if (userId) {
      const until = new Date();
      until.setMonth(until.getMonth() + 1);
      await db.$executeRaw`UPDATE profiles SET "bonnetPlusUntil" = ${until} WHERE id = ${userId}::uuid`;
    }
    return NextResponse.redirect(new URL("/garage?upgraded=true", process.env.NEXTAUTH_URL ?? req.nextUrl.origin));
  }

  return NextResponse.redirect(new URL("/pricing?error=payment_failed", process.env.NEXTAUTH_URL ?? req.nextUrl.origin));
}
