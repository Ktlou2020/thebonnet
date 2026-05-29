import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  const { businessName, contactName, email, phone, city, services } =
    (await req.json()) as {
      businessName: string;
      contactName?: string;
      email: string;
      phone?: string;
      city: string;
      services?: string[];
    };

  if (!businessName || !email || !city) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Upsert a Profile for this email
  let profile = await db.profile.findFirst({ where: { email } });
  if (!profile) {
    profile = await db.profile.create({
      data: {
        email,
        fullName: contactName ?? null,
        name: contactName ?? null,
        userRole: "WORKSHOP_OWNER",
      },
    });
  } else {
    profile = await db.profile.update({
      where: { id: profile.id },
      data: { userRole: "WORKSHOP_OWNER" },
    });
  }

  // Generate a unique slug
  const baseSlug = slugify(businessName);
  let slug = baseSlug;
  let attempt = 0;
  while (await db.workshop.findFirst({ where: { slug } })) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  // Create the workshop
  const workshop = await db.workshop.create({
    data: {
      ownerId: profile.id,
      name: businessName,
      slug,
      description: `${businessName} — workshop registered via The Bonnet`,
      city,
      province: "",
      phone: phone ?? null,
      listingTypes: services ?? [],
    },
  });

  // Welcome email
  try {
    await sendWelcomeEmail(email, contactName ?? businessName, true);
  } catch {
    // Don't fail the request if email fails
  }

  return NextResponse.json({ ok: true, workshopId: workshop.id });
}
