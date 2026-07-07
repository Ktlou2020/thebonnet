import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/db";

function slugify(name: string, city: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${base}-${citySlug}`;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const workshops = await prisma.workshop.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      suburb: true,
      phone: true,
      email: true,
      website: true,
      isVerified: true,
      status: true,
      featured: true,
      createdAt: true,
      subscription: { select: { tier: true } },
      _count: { select: { reviews: true, leadAssignments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    workshops.map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      city: w.city,
      suburb: w.suburb ?? null,
      phone: w.phone ?? null,
      email: w.email ?? null,
      website: w.website ?? null,
      isVerified: w.isVerified,
      status: w.status,
      featured: w.featured,
      subscriptionPlan: w.subscription?.tier ?? null,
      createdAt: w.createdAt,
      reviewCount: w._count.reviews,
      leadCount: w._count.leadAssignments,
    }))
  );
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  type Body = {
    name?: string;
    city?: string;
    suburb?: string;
    addressLine1?: string;
    province?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    description?: string;
    hoursText?: string;
    mobileService?: boolean;
    featured?: boolean;
    status?: string;
  };

  const body = (await request.json()) as Body;

  if (!body.name?.trim() || !body.city?.trim()) {
    return NextResponse.json({ error: "Name and city are required" }, { status: 400 });
  }

  const name = body.name.trim();
  const city = body.city.trim();
  const baseSlug = slugify(name, city);

  // Ensure slug uniqueness by appending a suffix if needed
  const existing = await prisma.workshop.findMany({
    where: { slug: { startsWith: baseSlug } },
    select: { slug: true },
  });
  const existingSlugs = new Set(existing.map((w) => w.slug));
  let slug = baseSlug;
  let suffix = 2;
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  // Ensure system profile for ownerId
  const systemProfile = await prisma.profile.upsert({
    where: { email: "system@thebonnet.co.za" },
    update: {},
    create: { email: "system@thebonnet.co.za", fullName: "My Bonnet System", role: "ADMIN" },
  });

  const workshop = await prisma.workshop.create({
    data: {
      ownerId: systemProfile.id,
      name,
      slug,
      city,
      suburb: body.suburb?.trim() || null,
      addressLine1: body.addressLine1?.trim() || null,
      province: body.province?.trim() || "Gauteng",
      phone: body.phone?.trim() || null,
      whatsapp: body.whatsapp?.trim() || null,
      email: body.email?.trim() || null,
      website: body.website?.trim() || null,
      description: body.description?.trim() || `${name} is a vehicle service and repair workshop in ${city}.`,
      hoursText: body.hoursText?.trim() || null,
      mobileService: body.mobileService ?? false,
      featured: body.featured ?? false,
      status: (body.status === "VERIFIED" ? "VERIFIED" : "PENDING") as "VERIFIED" | "PENDING",
      isVerified: body.status === "VERIFIED",
      verifiedAt: body.status === "VERIFIED" ? new Date() : null,
      sourceName: "Admin",
      listingTypes: ["Car Repair", "General Service"],
    },
  });

  return NextResponse.json({ ok: true, id: workshop.id, slug: workshop.slug }, { status: 201 });
}
