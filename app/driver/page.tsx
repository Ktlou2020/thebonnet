import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { DriverProfileTab } from "./driver-profile-tab";
import { DRIVER_LEVELS, WORKSHOP_BADGES, getLevelProgress } from "@/lib/gamification";

type TabName = "vehicles" | "quotes" | "history" | "rewards" | "profile";

export default async function DriverPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const params = (await searchParams) ?? {};
  const tab = (params.tab as TabName) || "vehicles";

  type ProfileData = {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    referralCode: string | null;
    vehicles: Array<{
      id: string;
      make: string;
      model: string;
      year: number;
      currentMileage: number | null;
      serviceRecords: Array<{ date: Date }>;
    }>;
    leads: Array<{
      id: string;
      serviceNeeded: string;
      city: string | null;
      status: string;
      createdAt: Date;
      assignments: Array<{ workshop: { name: string } }>;
    }>;
    xp: { totalXp: number; level: number } | null;
  };

  let profile: ProfileData | null = null;

  try {
    profile = await db.profile.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        referralCode: true,
        vehicles: {
          where: { isArchived: false },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            currentMileage: true,
            serviceRecords: {
              orderBy: { date: "desc" },
              take: 1,
              select: { date: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        leads: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            serviceNeeded: true,
            city: true,
            status: true,
            createdAt: true,
            assignments: {
              take: 1,
              select: { workshop: { select: { name: true } } },
            },
          },
        },
        xp: { select: { totalXp: true, level: true } },
      },
    });
  } catch {
    // DB unavailable
  }

  type ServiceRecordRow = {
    id: string;
    serviceType: string;
    date: Date;
    totalCostCents: number | null;
    workshopName: string | null;
    vehicle: { make: string; model: string; year: number };
  };

  let serviceRecords: ServiceRecordRow[] = [];
  if (profile) {
    try {
      const vehicleIds = profile.vehicles.map((v) => v.id);
      if (vehicleIds.length > 0) {
        serviceRecords = await db.serviceRecord.findMany({
          where: { vehicleId: { in: vehicleIds } },
          orderBy: { date: "desc" },
          take: 30,
          select: {
            id: true,
            serviceType: true,
            date: true,
            totalCostCents: true,
            workshopName: true,
            vehicle: { select: { make: true, model: true, year: true } },
          },
        });
      }
    } catch {
      // DB unavailable
    }
  }

  const vehicleCount = profile?.vehicles.length ?? 0;
  const serviceCount = serviceRecords.length;
  const activeQuotes = profile?.leads.filter((l) =>
    ["NEW", "ASSIGNED", "PENDING", "RESPONDED"].includes(l.status)
  ).length ?? 0;

  const tabs: { id: TabName; label: string }[] = [
    { id: "vehicles", label: "My Vehicles" },
    { id: "quotes", label: "My Quotes" },
    { id: "history", label: "Service History" },
    { id: "rewards", label: "XP & Rewards" },
    { id: "profile", label: "Profile" },
  ];

  const totalXp = profile?.xp?.totalXp ?? 0;
  const lvlProgress = getLevelProgress(totalXp);

  const statusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-700";
      case "ASSIGNED":
      case "RESPONDED": return "bg-amber-100 text-amber-700";
      case "ACCEPTED":
      case "CLOSED_WON": return "bg-green-100 text-green-700";
      case "EXPIRED":
      case "CLOSED_LOST":
      case "DECLINED": return "bg-slate-100 text-slate-500";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ink text-white px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="mt-1 text-slate-300 text-sm">{session.user.email}</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        {/* Stat cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Vehicles", value: String(vehicleCount) },
            { label: "Service records", value: String(serviceCount) },
            { label: "Active quotes", value: String(activeQuotes) },
          ].map((s) => (
            <div key={s.label} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{s.label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{s.value}</p>
            </div>
          ))}
          <div className="rounded-[2rem] border border-fire/20 bg-fire/5 p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-widest text-fire">XP · Level {lvlProgress.current.level}</p>
            <p className="mt-2 text-2xl font-bold text-fire">{totalXp.toLocaleString()} XP</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-fire/20">
              <div className="h-full rounded-full bg-fire transition-all" style={{ width: `${lvlProgress.pct}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-fire/70">{lvlProgress.current.icon} {lvlProgress.current.name}</p>
          </div>
        </div>

        {/* Tab nav */}
        <div className="mt-8 flex gap-1 border-b border-slate-200 overflow-x-auto">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={`/driver?tab=${t.id}`}
              className={`whitespace-nowrap px-5 py-3 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? "border-b-2 border-fire text-fire"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="py-8">
          {/* My Vehicles */}
          {tab === "vehicles" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">My Vehicles</h2>
                <Link
                  href="/garage"
                  className="rounded-full bg-fire px-5 py-2.5 text-sm font-semibold text-white shadow-glow-fire hover:bg-fire/90"
                >
                  Add Vehicle
                </Link>
              </div>
              {profile?.vehicles.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {profile.vehicles.map((v) => (
                    <div key={v.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
                      <p className="text-xs text-slate-400 font-medium">{v.year}</p>
                      <h3 className="text-lg font-bold text-slate-900">
                        {v.make} {v.model}
                      </h3>
                      {v.currentMileage && (
                        <p className="mt-1 text-sm text-slate-500">{v.currentMileage.toLocaleString()} km</p>
                      )}
                      {v.serviceRecords[0] && (
                        <p className="mt-2 text-xs text-slate-400">
                          Last service:{" "}
                          {new Date(v.serviceRecords[0].date).toLocaleDateString("en-ZA")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                  <p className="text-slate-500 text-sm">No vehicles yet. <Link href="/garage" className="font-semibold text-fire hover:underline">Add one in My Garage →</Link></p>
                </div>
              )}
            </div>
          )}

          {/* My Quotes */}
          {tab === "quotes" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">My Quotes</h2>
                <Link href="/quotes" className="text-sm font-semibold text-fire hover:underline">
                  View all →
                </Link>
              </div>
              {profile?.leads.length ? (
                <div className="space-y-3">
                  {profile.leads.map((lead) => (
                    <div key={lead.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{lead.serviceNeeded}</p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {lead.assignments[0]?.workshop.name ?? "Unassigned"} · {lead.city ?? "—"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(lead.createdAt).toLocaleDateString("en-ZA")}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                  <p className="text-slate-500 text-sm">No quote requests yet. <Link href="/mechanics" className="font-semibold text-fire hover:underline">Find a workshop →</Link></p>
                </div>
              )}
            </div>
          )}

          {/* Service History */}
          {tab === "history" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Service History</h2>
              {serviceRecords.length ? (
                <div className="space-y-3">
                  {serviceRecords.map((rec) => (
                    <div key={rec.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{rec.serviceType}</p>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {rec.vehicle.year} {rec.vehicle.make} {rec.vehicle.model}
                          </p>
                          {rec.workshopName && (
                            <p className="text-sm text-slate-500">{rec.workshopName}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(rec.date).toLocaleDateString("en-ZA")}
                          </p>
                        </div>
                        {rec.totalCostCents && (
                          <p className="shrink-0 text-sm font-semibold text-fire">
                            R{(rec.totalCostCents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                  <p className="text-slate-500 text-sm">No service records yet. <Link href="/garage" className="font-semibold text-fire hover:underline">Add your first service in My Garage →</Link></p>
                </div>
              )}
            </div>
          )}

          {/* XP & Rewards */}
          {tab === "rewards" && (
            <div className="space-y-8">
              {/* Level progress */}
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <h2 className="text-xl font-semibold text-slate-950 mb-6">Your driver level</h2>
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-5xl" aria-hidden>{lvlProgress.current.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-end justify-between mb-2">
                      <div>
                        <div className="text-xl font-bold text-slate-950">{lvlProgress.current.name}</div>
                        <div className="text-sm text-slate-500">Level {lvlProgress.current.level} · {totalXp.toLocaleString()} XP</div>
                      </div>
                      {lvlProgress.next && (
                        <div className="text-right text-sm text-slate-500">
                          <div className="font-semibold text-slate-700">{lvlProgress.next.name}</div>
                          <div>{lvlProgress.xpToNext.toLocaleString()} XP to go</div>
                        </div>
                      )}
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-fire to-amber-400 transition-all" style={{ width: `${lvlProgress.pct}%` }} />
                    </div>
                    {!lvlProgress.next && <p className="mt-2 text-sm font-semibold text-fire">Max level reached — you&apos;re a Legend! 🏆</p>}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {DRIVER_LEVELS.map((lvl) => {
                    const reached = totalXp >= lvl.minXp;
                    const current = lvl.level === lvlProgress.current.level;
                    return (
                      <div key={lvl.level} className={`rounded-2xl border p-4 text-center transition ${current ? "border-fire bg-fire/5" : reached ? "border-slate-200 bg-slate-50" : "border-slate-100 bg-white opacity-50"}`}>
                        <div className="text-2xl" aria-hidden>{lvl.icon}</div>
                        <div className={`mt-2 text-xs font-bold ${current ? "text-fire" : "text-slate-700"}`}>{lvl.name}</div>
                        <div className="mt-1 text-[10px] text-slate-400">{lvl.minXp.toLocaleString()}+ XP</div>
                        {current && <div className="mt-2 rounded-full bg-fire px-2 py-0.5 text-[10px] font-bold text-white">Current</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* How to earn XP */}
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <h2 className="text-xl font-semibold text-slate-950 mb-5">How to earn XP</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { action: "Write a review", xp: 100, icon: "⭐", cta: "/mechanics", ctaLabel: "Find a workshop" },
                    { action: "Log a service", xp: 50, icon: "🔧", cta: "/garage", ctaLabel: "Open My Garage" },
                    { action: "Add a vehicle", xp: 25, icon: "🚗", cta: "/garage", ctaLabel: "Add vehicle" },
                    { action: "Complete your first quote", xp: 75, icon: "📋", cta: "/request-quote", ctaLabel: "Request quotes" },
                    { action: "Refer a friend", xp: 150, icon: "🤝", cta: "/driver?tab=profile", ctaLabel: "Get referral code" },
                    { action: "Complete your profile", xp: 50, icon: "👤", cta: "/driver?tab=profile", ctaLabel: "Update profile" },
                  ].map(({ action, xp, icon, cta, ctaLabel }) => (
                    <div key={action} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <span className="text-2xl shrink-0" aria-hidden>{icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 text-sm">{action}</div>
                        <div className="text-fire text-xs font-bold mt-0.5">+{xp} XP</div>
                        <Link href={cta} className="mt-2 text-xs font-semibold text-fire hover:underline">{ctaLabel} →</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Profile */}
          {tab === "profile" && profile && (
            <DriverProfileTab
              email={profile.email}
              fullName={profile.fullName}
              phone={profile.phone}
              referralCode={profile.referralCode}
            />
          )}
        </div>
      </div>
    </div>
  );
}
