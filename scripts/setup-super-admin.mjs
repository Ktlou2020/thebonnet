import { AppRole, PrismaClient } from "@prisma/client";

async function main() {
  if (!process.env.DATABASE_URL || !process.env.ADMIN_EMAIL) {
    console.log("[admin] DATABASE_URL or ADMIN_EMAIL missing, skipping super admin sync.");
    return;
  }

  const prisma = new PrismaClient();

  try {
    await prisma.profile.upsert({
      where: { email: process.env.ADMIN_EMAIL.trim().toLowerCase() },
      update: {
        fullName: "The Bonnet Super Admin",
        role: AppRole.ADMIN
      },
      create: {
        email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
        fullName: "The Bonnet Super Admin",
        role: AppRole.ADMIN
      }
    });

    console.log(`[admin] Super admin synced for ${process.env.ADMIN_EMAIL.trim().toLowerCase()}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[admin] Failed to sync super admin.");
  console.error(error);
  process.exit(1);
});
