import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = (await req.json()) as {
    fullName?: string;
    email?: string;
    phone?: string;
    role?: string;
  };

  const { fullName, email, phone, role } = body;

  if (!fullName || !email || !phone || !role) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const workshop = await db.workshop.findUnique({ where: { slug } });
  if (!workshop) {
    return NextResponse.json({ error: "Workshop not found." }, { status: 404 });
  }

  const claimToken = crypto.randomUUID();

  await db.workshop.update({
    where: { id: workshop.id },
    data: { claimToken },
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  const emailServer = process.env.EMAIL_SERVER;
  const nextAuthUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (adminEmail && emailServer) {
    try {
      const transport = nodemailer.createTransport(emailServer);
      const approveLink = `${nextAuthUrl}/api/admin/claim/${claimToken}/approve`;

      await transport.sendMail({
        from: adminEmail,
        to: adminEmail,
        subject: `Workshop claim request: ${workshop.name}`,
        html: `
          <h2>Workshop Claim Request</h2>
          <p><strong>Workshop:</strong> ${workshop.name} (${workshop.city})</p>
          <hr />
          <p><strong>Claimant name:</strong> ${fullName}</p>
          <p><strong>Claimant email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Role:</strong> ${role}</p>
          <hr />
          <p><a href="${approveLink}">Approve this claim →</a></p>
        `,
      });
    } catch {
      // Email failures should not block the response
    }
  }

  return NextResponse.json({ success: true });
}
