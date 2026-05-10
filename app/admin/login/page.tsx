import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdminSession, hasAdminCredentials } from "@/lib/admin-auth";

export const metadata = {
  title: "Admin Login | The Bonnet"
};

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  const params = (await searchParams) ?? {};
  const disabled = !hasAdminCredentials();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-5xl items-center px-6 py-16 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] bg-[radial-gradient(circle_at_top,#183968,transparent_45%),linear-gradient(180deg,#08111f,#0b1730)] p-8 text-white shadow-soft">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85">
            <Image src="/brand/the-bonnet-logo.png" alt="The Bonnet" width={28} height={28} className="h-7 w-7 object-contain" />
            Private admin access
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">Manage leads, listings, and marketplace trust operations.</h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
            Sign in to review quote requests, manage workshop visibility, and control the customer-facing directory without exposing any admin functions on the public site.
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-950">Super admin login</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            This page is intentionally not linked from the public navigation. Use your private credentials to continue.
          </p>

          {params.error === "invalid" ? (
            <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">The email or password was not correct.</div>
          ) : null}

          {params.error === "disabled" ? (
            <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Admin credentials are not configured yet. Add the admin environment variables in Railway first.
            </div>
          ) : null}

          <form action="/api/admin/login" method="post" className="mt-8 grid gap-4">
            <input
              type="email"
              name="email"
              placeholder="Admin email"
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent"
              required
              disabled={disabled}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent"
              required
              disabled={disabled}
            />
            <button
              type="submit"
              disabled={disabled}
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-bonnet disabled:cursor-not-allowed disabled:opacity-60"
            >
              Sign in to admin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
