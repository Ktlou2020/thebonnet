import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export async function GET() {
  const prisma = getPrisma();

  if (!prisma) {
    return NextResponse.json({
      status: "warning",
      service: "my-bonnet-platform",
      database: "not-configured"
    });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      service: "my-bonnet-platform",
      database: "connected"
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        service: "my-bonnet-platform",
        database: "unreachable",
        message: error instanceof Error ? error.message : "Unknown database error"
      },
      { status: 500 }
    );
  }
}
