import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!rateLimit(`upload:${session.user.id}`, 10, 3_600_000)) {
    return NextResponse.json({ error: "Upload limit reached" }, { status: 429 });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json({ error: "Upload service not configured" }, { status: 503 });
  }

  const { image, folder } = (await req.json()) as {
    image: string;
    folder: string;
  };

  if (!image || !["workshops", "reviews", "vehicles"].includes(folder)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { uploadImage } = await import("@/lib/cloudinary");
  const { url } = await uploadImage(image, folder);
  return NextResponse.json({ url });
}
