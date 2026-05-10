import crypto from "node:crypto";
import { promisify } from "node:util";
import { AdminRole, AdminUserStatus, AppRole, PrismaClient } from "@prisma/client";

const scryptAsync = promisify(crypto.scrypt);

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

async function hashAdminPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  return `scrypt:${salt}:${Buffer.from(derivedKey).toString("hex")}`;
}

async function main() {
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const adminFullName = process.env.ADMIN_FULL_NAME || "The Bonnet Super Admin";

  if (!process.env.DATABASE_URL || !adminEmail || !adminPassword) {
    console.log("[admin] DATABASE_URL, ADMIN_EMAIL, or ADMIN_PASSWORD missing. Skipping super admin sync.");
    return;
  }

  const prisma = new PrismaClient();

  try {
    const passwordHash = await hashAdminPassword(adminPassword);

    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: {
        fullName: adminFullName,
        passwordHash,
        role: AdminRole.SUPER_ADMIN,
        status: AdminUserStatus.ACTIVE
      },
      create: {
        email: adminEmail,
        fullName: adminFullName,
        passwordHash,
        role: AdminRole.SUPER_ADMIN,
        status: AdminUserStatus.ACTIVE
      }
    });

    await prisma.profile.upsert({
      where: { email: adminEmail },
      update: {
        fullName: adminFullName,
        role: AppRole.ADMIN
      },
      create: {
        email: adminEmail,
        fullName: adminFullName,
        role: AppRole.ADMIN
      }
    });

    console.log(`[admin] Super admin synced for ${adminEmail}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[admin] Failed to sync super admin.");
  console.error(error);
  process.exit(1);
});
