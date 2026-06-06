import "server-only";

import crypto from "node:crypto";
import { promisify } from "node:util";
import type { AdminRole, AdminUser, AdminUserStatus, Prisma } from "@prisma/client";
import { AppRole } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

const ADMIN_COOKIE_NAME = "the_bonnet_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const scryptAsync = promisify(crypto.scrypt);

export const adminRoles = [
  "SUPER_ADMIN",
  "OPERATIONS_ADMIN",
  "SUPPORT_ADMIN",
  "CONTENT_ADMIN",
  "FINANCE_ADMIN"
] as const satisfies Readonly<AdminRole[]>;

export type AdminPermission =
  | "viewDashboard"
  | "manageLeads"
  | "manageWorkshops"
  | "manageQuotes"
  | "manageTrust"
  | "manageAdminUsers"
  | "viewAnalytics"
  | "manageSettings";

const roleLabels: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super admin",
  OPERATIONS_ADMIN: "Operations admin",
  SUPPORT_ADMIN: "Support admin",
  CONTENT_ADMIN: "Marketplace admin",
  FINANCE_ADMIN: "Finance admin"
};

const rolePermissions: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    "viewDashboard",
    "manageLeads",
    "manageWorkshops",
    "manageQuotes",
    "manageTrust",
    "manageAdminUsers",
    "viewAnalytics",
    "manageSettings"
  ],
  OPERATIONS_ADMIN: ["viewDashboard", "manageLeads", "manageWorkshops", "manageQuotes", "manageTrust", "viewAnalytics"],
  SUPPORT_ADMIN: ["viewDashboard", "manageLeads", "manageQuotes"],
  CONTENT_ADMIN: ["viewDashboard", "manageWorkshops", "manageTrust", "viewAnalytics"],
  FINANCE_ADMIN: ["viewDashboard", "manageQuotes", "viewAnalytics"]
};

export interface AdminSessionUser {
  id: string | null;
  email: string;
  fullName: string;
  role: AdminRole;
  status: AdminUserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  roleLabel: string;
  permissions: AdminPermission[];
  isBootstrap: boolean;
}

interface AdminSessionToken {
  adminUserId: string | null;
  email: string;
  exp: number;
}

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "change-me-in-railway";
}

function signPayload(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getRoleLabel(role: AdminRole) {
  return roleLabels[role];
}

export function getRolePermissions(role: AdminRole) {
  return rolePermissions[role];
}

export function canAdminAccess(role: AdminRole, permission: AdminPermission) {
  return getRolePermissions(role).includes(permission);
}

function shapeAdminUser(admin: Pick<AdminUser, "id" | "email" | "fullName" | "role" | "status" | "lastLoginAt" | "createdAt" | "updatedAt">, isBootstrap = false): AdminSessionUser {
  return {
    id: admin.id,
    email: admin.email,
    fullName: admin.fullName,
    role: admin.role,
    status: admin.status,
    lastLoginAt: admin.lastLoginAt,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
    roleLabel: getRoleLabel(admin.role),
    permissions: getRolePermissions(admin.role),
    isBootstrap
  };
}

function getBootstrapIdentity() {
  return {
    email: normalizeEmail(process.env.ADMIN_EMAIL || ""),
    password: process.env.ADMIN_PASSWORD || "",
    fullName: process.env.ADMIN_FULL_NAME || "My Bonnet Super Admin"
  };
}

function getBootstrapFallbackUser() {
  const bootstrap = getBootstrapIdentity();
  if (!bootstrap.email) return null;

  const now = new Date();
  return shapeAdminUser(
    {
      id: bootstrap.email,
      email: bootstrap.email,
      fullName: bootstrap.fullName,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now
    },
    true
  );
}

export function hasAdminBootstrapCredentials() {
  const bootstrap = getBootstrapIdentity();
  return Boolean(bootstrap.email && bootstrap.password && process.env.ADMIN_SESSION_SECRET);
}

export async function isAdminAuthConfigured() {
  if (!process.env.ADMIN_SESSION_SECRET) return false;
  if (hasAdminBootstrapCredentials()) return true;

  const prisma = getPrisma();
  if (!prisma) return false;

  try {
    const count = await prisma.adminUser.count({ where: { status: { in: ["ACTIVE", "INVITED"] } } });
    return count > 0;
  } catch {
    return false;
  }
}

export async function hashAdminPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyAdminPassword(password: string, passwordHash: string) {
  const [algorithm, salt, storedKey] = passwordHash.split(":");
  if (algorithm !== "scrypt" || !salt || !storedKey) return false;

  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuffer = Buffer.from(storedKey, "hex");

  if (derivedKey.length !== storedBuffer.length) return false;
  return crypto.timingSafeEqual(derivedKey, storedBuffer);
}

async function findAdminUserByEmail(email: string) {
  const prisma = getPrisma();
  if (!prisma) return null;

  try {
    return await prisma.adminUser.findUnique({ where: { email } });
  } catch {
    return null;
  }
}

async function findAdminUserById(id: string) {
  const prisma = getPrisma();
  if (!prisma) return null;

  try {
    return await prisma.adminUser.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export async function bootstrapPrimaryAdminFromEnv() {
  const prisma = getPrisma();
  const bootstrap = getBootstrapIdentity();

  if (!prisma || !bootstrap.email || !bootstrap.password) return null;

  const passwordHash = await hashAdminPassword(bootstrap.password);

  try {
    const adminUser = await prisma.adminUser.upsert({
      where: { email: bootstrap.email },
      update: {
        fullName: bootstrap.fullName,
        passwordHash,
        role: "SUPER_ADMIN",
        status: "ACTIVE"
      },
      create: {
        email: bootstrap.email,
        fullName: bootstrap.fullName,
        passwordHash,
        role: "SUPER_ADMIN",
        status: "ACTIVE"
      }
    });

    await prisma.profile.upsert({
      where: { email: bootstrap.email },
      update: {
        fullName: bootstrap.fullName,
        role: AppRole.ADMIN
      },
      create: {
        email: bootstrap.email,
        fullName: bootstrap.fullName,
        role: AppRole.ADMIN
      }
    });

    return adminUser;
  } catch {
    return null;
  }
}

async function touchAdminLogin(adminUserId: string | null, email: string) {
  const prisma = getPrisma();
  if (!prisma || !adminUserId) return;

  try {
    await prisma.adminUser.update({
      where: { id: adminUserId },
      data: { lastLoginAt: new Date() }
    });

    await prisma.adminAuditLog.create({
      data: {
        actorId: adminUserId,
        action: "admin.sign_in",
        entityType: "admin_user",
        entityId: adminUserId,
        summary: `${email} signed in to the admin console.`
      }
    });
  } catch {
    // Ignore login audit failures so auth can continue.
  }
}

export async function authenticateAdminUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const bootstrap = getBootstrapIdentity();

  if (!normalizedEmail || !password) return null;

  if (hasAdminBootstrapCredentials() && normalizedEmail === bootstrap.email) {
    const emailMatches = normalizedEmail.length === bootstrap.email.length && crypto.timingSafeEqual(Buffer.from(normalizedEmail), Buffer.from(bootstrap.email));
    const passwordMatches = password.length === bootstrap.password.length && crypto.timingSafeEqual(Buffer.from(password), Buffer.from(bootstrap.password));

    if (emailMatches && passwordMatches) {
      const bootstrappedAdmin = await bootstrapPrimaryAdminFromEnv();

      if (bootstrappedAdmin) {
        await touchAdminLogin(bootstrappedAdmin.id, bootstrappedAdmin.email);
        return shapeAdminUser({ ...bootstrappedAdmin, lastLoginAt: new Date() }, true);
      }

      const fallback = getBootstrapFallbackUser();
      if (fallback) return { ...fallback, lastLoginAt: new Date() };
    }
  }

  const adminUser = await findAdminUserByEmail(normalizedEmail);
  if (!adminUser || adminUser.status !== "ACTIVE") return null;

  const passwordMatches = await verifyAdminPassword(password, adminUser.passwordHash);
  if (!passwordMatches) return null;

  await touchAdminLogin(adminUser.id, adminUser.email);
  return shapeAdminUser({ ...adminUser, lastLoginAt: new Date() });
}

export function createAdminSessionToken(admin: { id: string | null; email: string }) {
  const payload = JSON.stringify({ adminUserId: admin.id, email: normalizeEmail(admin.email), exp: Date.now() + SESSION_TTL_MS });
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
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AdminSessionToken;
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

export async function getCurrentAdminUser() {
  const session = await getAdminSession();
  if (!session) return null;

  if (session.adminUserId) {
    const adminUser = await findAdminUserById(session.adminUserId);
    if (adminUser && adminUser.status === "ACTIVE") {
      return shapeAdminUser(adminUser, adminUser.email === getBootstrapIdentity().email);
    }
  }

  const adminUserByEmail = await findAdminUserByEmail(session.email);
  if (adminUserByEmail && adminUserByEmail.status === "ACTIVE") {
    return shapeAdminUser(adminUserByEmail, adminUserByEmail.email === getBootstrapIdentity().email);
  }

  const fallback = getBootstrapFallbackUser();
  if (fallback && fallback.email === session.email) {
    return fallback;
  }

  return null;
}

export async function requireAdminUser(permission: AdminPermission = "viewDashboard") {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    redirect("/admin/login");
  }

  if (!canAdminAccess(adminUser.role, permission)) {
    redirect("/admin?denied=1");
  }

  return adminUser;
}

export function attachAdminSession(response: NextResponse, admin: { id: string | null; email: string }) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: createAdminSessionToken(admin),
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

export async function logAdminAction(input: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Prisma.InputJsonValue | null;
}) {
  const prisma = getPrisma();
  if (!prisma || !input.actorId) return;

  try {
    await prisma.adminAuditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || null,
        summary: input.summary,
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined
      }
    });
  } catch {
    // Ignore audit failures in request flow.
  }
}
