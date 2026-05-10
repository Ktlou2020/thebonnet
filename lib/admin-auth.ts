import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "the_bonnet_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "change-me-in-railway";
}

function signPayload(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function getAdminCredentials() {
  return {
    email: (process.env.ADMIN_EMAIL || "").trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || ""
  };
}

export function hasAdminCredentials() {
  const { email, password } = getAdminCredentials();
  return Boolean(email && password && process.env.ADMIN_SESSION_SECRET);
}

export function verifyAdminCredentials(email: string, password: string) {
  const expected = getAdminCredentials();
  const normalizedEmail = email.trim().toLowerCase();

  if (!expected.email || !expected.password) return false;
  if (normalizedEmail.length !== expected.email.length || password.length !== expected.password.length) return false;

  const emailMatches = crypto.timingSafeEqual(Buffer.from(normalizedEmail), Buffer.from(expected.email));
  const passwordMatches = crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expected.password));
  return emailMatches && passwordMatches;
}

export function createAdminSessionToken(email: string) {
  const payload = JSON.stringify({ email: email.trim().toLowerCase(), exp: Date.now() + SESSION_TTL_MS });
  const encoded = Buffer.from(payload).toString("base64url");
  const signature = signPayload(encoded);
  return `${encoded}.${signature}`;
}

export function readAdminSessionToken(token?: string | null) {
  if (!token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  if (signPayload(encoded) !== signature) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as { email: string; exp: number };
    if (!payload?.email || !payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  return readAdminSessionToken(token);
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  const expected = getAdminCredentials();

  if (!session || !expected.email || session.email !== expected.email) {
    redirect("/admin/login");
  }

  return session;
}

export function attachAdminSession(response: NextResponse, email: string) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: createAdminSessionToken(email),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000
  });
  return response;
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}
