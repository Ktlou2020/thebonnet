import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendWhatsApp } from "@/lib/whatsapp";
import { rateLimit } from "@/lib/rate-limit";
import { sendReviewNotificationEmail } from "@/lib/email";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const ip = (await headers()).get("x-forwarded-for") ?? "anonymous";
  if (!rateLimit(`reviews:${ip}`, 3, 300_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    workshopSlug: string;
    rating: number;
    body: string;
    jobType?: string;
    costCents?: number;
  };

  if (!body.workshopSlug || !body.rating || !body.body) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const workshop = await db.workshop.findUnique({ where: { slug: body.workshopSlug } });
  if (!workshop) {
    return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
  }

  const profile = await db.profile.findUnique({ where: { email: session.user.email } });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const baseReview = await db.review.create({
    data: {
      workshopId: workshop.id,
      userId: profile.id,
      rating: Math.max(1, Math.min(5, body.rating)),
      body: body.body,
    },
  });

  const authorName = profile.fullName ?? profile.name ?? session.user.email;
  await db.$executeRaw`UPDATE reviews SET "authorName" = ${authorName}, "profileId" = ${profile.id}::uuid, "jobType" = ${body.jobType ?? null}, "costCents" = ${body.costCents ?? null}, status = 'PENDING' WHERE id = ${baseReview.id}::uuid`;

  const review = { ...baseReview, authorName, jobType: body.jobType, costCents: body.costCents };

  const phone = workshop.whatsapp ?? workshop.phone;
  if (phone) {
    await sendWhatsApp({
      to: phone,
      body: `⭐ New ${review.rating}-star review for ${workshop.name} on The Bonnet.\n\nView and respond: https://thebonnet.co.za/dashboard/reviews`,
    }).catch(() => null);
  }

  // Email notification to workshop owner
  try {
    const owner = await db.profile.findUnique({ where: { id: workshop.ownerId }, select: { email: true } });
    if (owner?.email) {
      await sendReviewNotificationEmail(owner.email, {
        workshopName: workshop.name,
        rating: review.rating,
        reviewUrl: `https://thebonnet.co.za/dashboard/reviews`,
      });
    }
  } catch {
    // Don't fail the request if email fails
  }

  return NextResponse.json({ ok: true, review });
}
