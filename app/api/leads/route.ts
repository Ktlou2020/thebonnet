import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();

  return NextResponse.json({
    ok: true,
    message: `Lead captured for ${payload.vehicle} in ${payload.location}. Route this to the top 3 verified workshops.`,
    receivedAt: new Date().toISOString()
  });
}
