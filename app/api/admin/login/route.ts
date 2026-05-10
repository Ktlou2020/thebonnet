import { NextResponse } from "next/server";
import { attachAdminSession, hasAdminCredentials, verifyAdminCredentials } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!hasAdminCredentials()) {
    return NextResponse.redirect(new URL("/admin/login?error=disabled", request.url));
  }

  if (!verifyAdminCredentials(email, password)) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url));
  }

  const response = NextResponse.redirect(new URL("/admin", request.url));
  return attachAdminSession(response, email);
}
