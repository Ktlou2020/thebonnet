import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const body = await req.json() as {
    email?: string;
    password?: string;
    fullName?: string;
    userRole?: string;
    phone?: string;
  };

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const fullName = body.fullName?.trim() || null;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await db.profile.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const userRole = body.userRole === "WORKSHOP_OWNER" ? "WORKSHOP_OWNER" : "DRIVER";

  await db.profile.create({
    data: {
      email,
      fullName,
      passwordHash,
      userRole,
      phone: body.phone?.trim() || null,
      emailVerified: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
