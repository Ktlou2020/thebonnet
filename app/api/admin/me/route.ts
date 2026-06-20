import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ admin: null }, { status: 401 });
  return NextResponse.json({
    admin: {
      email: admin.email,
      fullName: admin.fullName,
      roleLabel: admin.roleLabel,
    },
  });
}
