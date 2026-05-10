import { NextResponse } from "next/server";
import { attachAdminSession, authenticateAdminUser, isAdminAuthConfigured } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!(await isAdminAuthConfigured())) {
    return NextResponse.redirect(new URL("/admin/login?error=disabled", request.url), 303);
  }

  const adminUser = await authenticateAdminUser(email, password);

  if (!adminUser) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  return attachAdminSession(response, { id: adminUser.id, email: adminUser.email });
}
