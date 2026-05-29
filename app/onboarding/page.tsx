import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user ?? {};
  const firstName = ((user as { name?: string | null }).name ?? (user as { email?: string | null }).email ?? "there").split(" ")[0];
  const isWorkshop = (user as { role?: string }).role === "WORKSHOP_OWNER";

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        <div className="mb-2 text-sm font-semibold uppercase tracking-widest text-fire">Welcome</div>
        <h1 className="text-4xl font-bold mb-2">Welcome, {firstName}!</h1>
        <p className="text-slate-400 mb-10">Here&apos;s where you can go next.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          {isWorkshop ? (
            <>
              <Link href="/dashboard" className="rounded-[2rem] border border-white/10 bg-white/5 p-6 hover:border-fire/30 transition block">
                <div className="text-3xl mb-3">🔧</div>
                <h2 className="font-bold text-lg mb-1">Complete your profile</h2>
                <p className="text-sm text-slate-400">Set up your workshop listing and start receiving leads.</p>
              </Link>
              <Link href="/dashboard" className="rounded-[2rem] border border-white/10 bg-white/5 p-6 hover:border-fire/30 transition block">
                <div className="text-3xl mb-3">📋</div>
                <h2 className="font-bold text-lg mb-1">Browse your leads</h2>
                <p className="text-sm text-slate-400">See quote requests from drivers in your area.</p>
              </Link>
            </>
          ) : (
            <>
              <Link href="/garage" className="rounded-[2rem] border border-white/10 bg-white/5 p-6 hover:border-fire/30 transition block">
                <div className="text-3xl mb-3">🚗</div>
                <h2 className="font-bold text-lg mb-1">My Garage</h2>
                <p className="text-sm text-slate-400">Add your vehicles and track services, costs, and history.</p>
              </Link>
              <Link href="/mechanics" className="rounded-[2rem] border border-white/10 bg-white/5 p-6 hover:border-fire/30 transition block">
                <div className="text-3xl mb-3">🔍</div>
                <h2 className="font-bold text-lg mb-1">Find a mechanic</h2>
                <p className="text-sm text-slate-400">Browse workshops by city and service type.</p>
              </Link>
            </>
          )}
        </div>

        {!isWorkshop && (
          <div className="mt-6 rounded-2xl border border-fire/20 bg-fire/5 p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="font-semibold text-sm">Upgrade to Bonnet Plus</div>
              <div className="text-xs text-slate-400 mt-0.5">Unlimited AI diagnoses, unlimited garage vehicles — R49/mo</div>
            </div>
            <Link href="/#pricing" className="shrink-0 rounded-full bg-fire px-4 py-2 text-sm font-semibold text-white shadow-glow-fire">
              Upgrade
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
