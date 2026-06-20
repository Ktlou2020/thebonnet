import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Users, TrendingUp } from "lucide-react";
import { getPrisma } from "@/lib/db";
import { requireAdminUser, logAdminAction } from "@/lib/admin-auth";
import type { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

const PLATFORM_ROLES = ["DRIVER", "WORKSHOP_OWNER", "ADMIN"] as const satisfies Readonly<UserRole[]>;

const ROLE_BADGE: Record<string, string> = {
  DRIVER: "bg-sky-50 text-sky-700",
  WORKSHOP_OWNER: "bg-violet-50 text-violet-700",
  ADMIN: "bg-fire/10 text-fire",
};

function getLevelLabel(xp: number) {
  if (xp >= 5000) return "Legend";
  if (xp >= 2000) return "Pit Crew";
  if (xp >= 750) return "Road Warrior";
  if (xp >= 200) return "Regular";
  return "Rookie";
}

async function changePlatformUserRole(formData: FormData) {
  "use server";
  const admin = await requireAdminUser("manageAdminUsers");
  const prisma = getPrisma();
  if (!prisma) return;

  const profileId = String(formData.get("profileId") ?? "");
  const role = String(formData.get("role") ?? "") as UserRole;
  if (!profileId || !PLATFORM_ROLES.includes(role)) return;

  await prisma.profile.update({ where: { id: profileId }, data: { userRole: role } });

  await logAdminAction({
    actorId: admin.id,
    action: "platform_user.role_changed",
    entityType: "profile",
    entityId: profileId,
    summary: `${admin.email} changed platform user role to ${role}.`,
    metadata: { role },
  });

  revalidatePath("/admin/users");
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; role?: string }>;
}) {
  await requireAdminUser("manageAdminUsers");
  const params = (await searchParams) ?? {};
  const q = (params.q ?? "").toLowerCase();
  const roleFilter = params.role ?? "ALL";
  const prisma = getPrisma();

  const profiles = prisma
    ? await prisma.profile.findMany({
        orderBy: { createdAt: "desc" },
        take: 300,
        include: {
          _count: { select: { vehicles: true, reviews: true, leads: true } },
          xp: true,
        },
      })
    : [];

  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 3600 * 1000;

  const filtered = profiles.filter((p) => {
    const roleMatch = roleFilter === "ALL" || p.userRole === roleFilter;
    const qMatch = !q || [p.fullName ?? "", p.email].join(" ").toLowerCase().includes(q);
    return roleMatch && qMatch;
  });

  const totalDrivers = profiles.filter((p) => p.userRole === "DRIVER").length;
  const totalWorkshopOwners = profiles.filter((p) => p.userRole === "WORKSHOP_OWNER").length;
  const newThisMonth = profiles.filter((p) => p.createdAt.getTime() > thirtyDaysAgo).length;

  const roles = ["ALL", ...PLATFORM_ROLES];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ink px-6 py-10 text-white lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 mb-4">
            <Users className="h-4 w-4 text-accent" />
            Platform user management
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">Platform Users</h1>
          <p className="mt-2 text-slate-300 text-sm leading-7">All registered drivers and workshop owners on My Bonnet.</p>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:w-fit">
            <div><div className="text-3xl font-bold text-fire">{profiles.length}</div><div className="mt-1 text-xs text-slate-400">Total users</div></div>
            <div><div className="text-3xl font-bold text-fire">{totalDrivers}</div><div className="mt-1 text-xs text-slate-400">Drivers</div></div>
            <div><div className="text-3xl font-bold text-fire">{totalWorkshopOwners}</div><div className="mt-1 text-xs text-slate-400">Workshop owners</div></div>
            <div><div className="text-3xl font-bold text-fire flex items-center gap-1"><TrendingUp className="h-5 w-5" />{newThisMonth}</div><div className="mt-1 text-xs text-slate-400">New this month</div></div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8 space-y-6">
        {/* Filters */}
        <form method="get" className="flex flex-wrap items-end gap-3 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
          <label className="flex-1 min-w-48 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Search
            <input name="q" defaultValue={params.q} placeholder="Name or email" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Role
            <select name="role" defaultValue={roleFilter} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent">
              {roles.map((r) => <option key={r} value={r}>{r === "ALL" ? "All roles" : r.replace("_", " ")}</option>)}
            </select>
          </label>
          <button type="submit" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">Apply</button>
          <Link href="/admin/users" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">Reset</Link>
        </form>

        <div className="text-sm text-slate-500">{filtered.length} user{filtered.length !== 1 ? "s" : ""} shown</div>

        {/* User cards */}
        {filtered.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white py-16 text-center">
            <Users className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No users match your filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => {
              const xp = p.xp?.totalXp ?? 0;
              return (
                <div key={p.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                        {(p.fullName?.[0] ?? p.email[0] ?? "?").toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{p.fullName ?? "—"}</div>
                        <div className="text-xs text-slate-500">{p.email}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE[p.userRole] ?? "bg-slate-100 text-slate-600"}`}>
                        {p.userRole.replace("_", " ")}
                      </span>
                      {xp > 0 && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                          {getLevelLabel(xp)} · {xp} XP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>{p._count.vehicles} vehicle{p._count.vehicles !== 1 ? "s" : ""}</span>
                    <span>{p._count.leads} quote request{p._count.leads !== 1 ? "s" : ""}</span>
                    <span>{p._count.reviews} review{p._count.reviews !== 1 ? "s" : ""}</span>
                    <span>Joined {p.createdAt.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>

                  {/* Role change form */}
                  <form action={changePlatformUserRole} className="mt-4 flex flex-wrap items-end gap-3">
                    <input type="hidden" name="profileId" value={p.id} />
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Change role
                      <select name="role" defaultValue={p.userRole} className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent">
                        {PLATFORM_ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                      </select>
                    </label>
                    <button type="submit" className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                      Save role
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
