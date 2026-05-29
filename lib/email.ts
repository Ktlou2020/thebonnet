import nodemailer from "nodemailer";

function createTransport() {
  return nodemailer.createTransport(process.env.EMAIL_SERVER ?? "smtp://localhost:1025");
}

function layout(content: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#1e293b;margin:0;padding:0">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#08111f;padding:24px 32px;text-align:center">
      <span style="color:#f97316;font-size:22px;font-weight:800;letter-spacing:-0.5px">The Bonnet</span>
      <span style="color:#94a3b8;font-size:13px;margin-left:8px">SA's mechanic marketplace</span>
    </div>
    <div style="padding:32px">${content}</div>
    <div style="background:#f8fafc;padding:16px 32px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0">
      &copy; ${new Date().getFullYear()} The Bonnet &middot; South Africa
    </div>
  </div>
</body></html>`;
}

function btn(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;box-shadow:0 4px 16px rgba(249,115,22,0.35);margin:20px 0">${text}</a>`;
}

async function send(to: string, subject: string, html: string) {
  await createTransport().sendMail({
    from: process.env.EMAIL_FROM ?? "noreply@thebonnet.co.za",
    to,
    subject,
    html,
  });
}

export async function sendMagicLinkEmail(to: string, url: string) {
  await send(to, "Your sign-in link for The Bonnet", layout(`
    <h2 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px">Sign in to The Bonnet</h2>
    <p style="color:#64748b;line-height:1.6;margin:0 0 24px">Click the button below to sign in. This link expires in <strong>10 minutes</strong>.</p>
    ${btn("Sign in to The Bonnet", url)}
    <p style="color:#94a3b8;font-size:13px;margin:16px 0 0">If you didn't request this, ignore this email.</p>
  `));
}

export async function sendQuoteNotificationEmail(to: string, opts: {
  workshopName: string;
  service: string;
  city: string;
  dashboardUrl: string;
}) {
  await send(to, `New quote request for ${opts.service} in ${opts.city}`, layout(`
    <h2 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px">New quote request 🔧</h2>
    <p style="color:#64748b;line-height:1.6;margin:0 0 16px">A driver in <strong>${opts.city}</strong> needs <strong>${opts.service}</strong>. Be the first to respond.</p>
    ${btn("View request on dashboard", opts.dashboardUrl)}
    <p style="color:#94a3b8;font-size:13px;margin:16px 0 0">Workshops that reply within 2 hours close 3&times; more leads.</p>
  `));
}

export async function sendQuoteReceivedEmail(to: string, opts: {
  workshopName: string;
  amountRands: number;
  service: string;
  quotesUrl: string;
}) {
  await send(to, `Quote from ${opts.workshopName} — R${opts.amountRands.toLocaleString()}`, layout(`
    <h2 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px">You have a quote! ✅</h2>
    <p style="color:#64748b;line-height:1.6;margin:0 0 8px"><strong>${opts.workshopName}</strong> responded to your ${opts.service} request.</p>
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin:16px 0;text-align:center">
      <div style="font-size:32px;font-weight:800;color:#f97316">R${opts.amountRands.toLocaleString()}</div>
      <div style="color:#92400e;font-size:13px">Quoted price</div>
    </div>
    ${btn("View quote and respond", opts.quotesUrl)}
  `));
}

export async function sendReviewNotificationEmail(to: string, opts: {
  workshopName: string;
  rating: number;
  reviewUrl: string;
}) {
  await send(to, `New ${"⭐".repeat(opts.rating)} review for ${opts.workshopName}`, layout(`
    <h2 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px">New review received ${"⭐".repeat(opts.rating)}</h2>
    <p style="color:#64748b;line-height:1.6;margin:0 0 16px">A customer left a <strong>${opts.rating}-star review</strong> for <strong>${opts.workshopName}</strong>.</p>
    ${btn("View and reply to review", opts.reviewUrl)}
  `));
}

export async function sendWelcomeEmail(to: string, name: string, isWorkshop: boolean) {
  const subject = isWorkshop ? "Your workshop is live on The Bonnet" : "Welcome to The Bonnet";
  const content = isWorkshop
    ? `<h2 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px">Your workshop is live! 🔧</h2>
       <p style="color:#64748b;line-height:1.6;margin:0 0 16px">Welcome, ${name}. Complete your profile to start receiving leads.</p>
       ${btn("Set up your workshop", "https://thebonnet.co.za/dashboard")}`
    : `<h2 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px">Welcome to The Bonnet, ${name}! 🚗</h2>
       <p style="color:#64748b;line-height:1.6;margin:0 0 16px">Add your first vehicle to My Garage or find a mechanic near you.</p>
       ${btn("Go to My Garage", "https://thebonnet.co.za/garage")}`;
  await send(to, subject, layout(content));
}
