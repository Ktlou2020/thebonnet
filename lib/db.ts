import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export function getPrisma() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!global.__prisma__) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    global.__prisma__ = new PrismaClient({ adapter });
  }

  return global.__prisma__;
}
