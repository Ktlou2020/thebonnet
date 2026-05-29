import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.$executeRaw`UPDATE reviews SET "helpfulCount" = "helpfulCount" + 1 WHERE id = ${id}::uuid`;
  const result = await db.$queryRaw<Array<{ helpfulCount: number }>>`SELECT "helpfulCount" FROM reviews WHERE id = ${id}::uuid`;
  const helpfulCount = result[0]?.helpfulCount ?? 0;
  return NextResponse.json({ helpfulCount });
}
