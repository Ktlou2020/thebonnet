import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // Allow either an admin session OR a valid token match
  const session = await getAdminSession();

  const workshop = await db.workshop.findFirst({
    where: { claimToken: token },
    select: { id: true, claimToken: true },
  });

  if (!workshop) {
    return NextResponse.json({ error: "Invalid or expired token." }, { status: 404 });
  }

  if (!session) {
    // No admin session — require the token to be correct (already checked above)
    // For extra security in production you could require a session; we allow token-only for email verification links
  }

  // We need the email from the claim context; since we don't store it we set claimedByProfileId
  // by attempting to find or create a profile. We mark the workshop as claimed using ownerId as the profile.
  // The email should be passed as a query param from the email link or we use the owner's existing profile.
  const emailParam = req.nextUrl.searchParams.get("email");

  let profileId: string | null = null;

  if (emailParam) {
    let profile = await db.profile.findUnique({ where: { email: emailParam } });
    if (!profile) {
      profile = await db.profile.create({
        data: {
          email: emailParam,
          role: "MECHANIC_OWNER",
          userRole: "WORKSHOP_OWNER",
        },
      });
    }
    profileId = profile.id;
  }

  await db.workshop.update({
    where: { id: workshop.id },
    data: {
      claimedByProfileId: profileId,
      claimedAt: new Date(),
      claimToken: null,
      ...(profileId ? { ownerId: profileId } : {}),
    },
  });

  return NextResponse.redirect(new URL("/admin/workshops", req.url));
}
