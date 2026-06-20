import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireAdminUser, logAdminAction } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

async function changePlatformUserRole(formData: FormData) {
  "use server";
  const admin = await requireAdminUser("manageAdminUsers");
  const prisma = getPrisma();
  if (!prisma) return;
  const profileId = String(formData.get("profileId") ?? "");
  const newRole = String(formData.get("userRole") ?? "") as "DRIVER" | "WORKSHOP_OWNER" | "ADMIN";
  if (!profileId || !["DRIVER", "WORKSHOP_OWNER", "ADMIN"].includes(newRole)) return;
  await prisma.profile.update({ where: { id: profileId }, data: { userRole: newRole } });
  await logAdminAction({
    actorId: admin.id,
    action: "platform_user.role_changed",
    entityType: "profile",
    entityId: profileId,
    summary: `${admin.email} changed platform user role to ${newRole}.`,
    metadata: { newRole },
  });
  revalidatePath("/admin/users");
}

async function suspendPlatformUser(formData: FormData) {
  "use server";
  const admin = await requireAdminUser("manageAdminUsers");
  const prisma = getPrisma();
  if (!prisma) return;
  const profileId = String(formData.get("profileId") ?? "");
  const action = String(formData.get("action") ?? "suspend");
  if (!profileId) return;
  await logAdminAction({
    actorId: admin.id,
    action: action === "unsuspend" ? "platform_user.unsuspended" : "platform_user.suspended",
    entityType: "profile",
    entityId: profileId,
    summary: `${admin.email} ${action === "unsuspend" ? "unsuspended" : "suspended"} a platform user.`,
  });
  revalidatePath("/admin/users");
}

const platformRoles = ["DRIVER", "WORKSHOP_OWNER", "ADMIN"] as const;
type PlatformRole = (typeof platformRoles)[number];

const roleBadge: Record<PlatformRole, string> = {
  DRIVER: "bg-sky-50 text-sky-700",
  WORKSHOP_OWNER: "bg-violet-50 text-violet-700",
  ADMIN: "bg-fire/10 text-fire",
};

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

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const totalUsers = profiles.length;
  const driversCount = profiles.filter((p) => p.userRole === "DRIVER").length;
  const workshopOwnersCount = profiles.filter((p) => p.userRole === "WORKSHOP_OWNER").length;
  const adminsCount = profiles.filter((p) => p.userRole === "ADMIN" || p.role === "ADMIN").length;
  const activeThisMonth = profiles.filter((p) => p.createdAt >= thirtyDaysAgo).length;

  const filtered = profiles.filter((p) => {
    const roleMatch = roleFilter === "ALL" || p.userRole === roleFilter;
    const qMatch = !q || [p.fullName ?? "", p.email].join(" ").toLowerCase().includes(q);
    return roleMatch && qMatch;
  });

  const filterRoles = ["ALL", "DRIVER", "WORKSHOP_OWNER", "ADMIN"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div
        className="px-6 py-10 text-white lg:px-8"
        style={{
          background:
            "radial-gradient(circle at top,#1a3b6c,transparent 45%),linear-gradient(180deg,#08111f,#0b1730)",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Platform users</h1>
          <p className="mt-1 text-sm text-slate-300">
            All registered drivers and workshop owners on the platform.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Total users", value: totalUsers },
            { label: "Drivers", value: driversCount },
            { label: "Workshop owners", value: workshopOwnersCount },
            { label: "Admins", value: adminsCount },
            { label: "Joined this month", value: activeThisMonth },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft"
            >
              <p className="text-2xl font-bold text-slate-950">{value}</p>
              <p className="mt-1 text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <form
          method="get"
          className="flex flex-wrap items-end gap-3 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft"
        >
          <label className="flex-1 text-sm font-medium text-slate-700">
            Search
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Name or email"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Role
            <select
              name="role"
              defaultValue={roleFilter}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
            >
              {filterRoles.map((r) => (
                <option key={r} value={r}>
                  {r === "ALL" ? "All roles" : r}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            Apply
          </button>
          <Link
            href="/admin/users"
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Reset
          </Link>
        </form>

        <div className="text-sm text-slate-500">
          {filtered.length} user{filtered.length === 1 ? "" : "s"}
        </div>

        {/* Users table */}
        <div className="overflow-x-auto rounded-[2rem] border border-slate-200 bg-white shadow-soft">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">XP / Level</th>
                <th className="px-5 py-3">Vehicles</th>
                <th className="px-5 py-3">Reviews</th>
                <th className="px-5 py-3">Leads</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Change role</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-slate-500">
                    No users match.
                  </td>
                </tr>
              )}
              {filtered.map((p) => {
                const role = p.userRole as PlatformRole | null;
                return (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-950">{p.fullName ?? "—"}</div>
                      <div className="text-xs text-slate-500">{p.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          role && roleBadge[role]
                            ? roleBadge[role]
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {p.userRole}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-semibold text-slate-950">{p.xp?.totalXp ?? 0}</span>
                      <span className="ml-1 text-xs text-slate-400">
                        Lv {p.xp?.level ?? 1}
                      </span>
                    </td>
                    <td className="px-5 py-3">{p._count.vehicles}</td>
                    <td className="px-5 py-3">{p._count.reviews}</td>
                    <td className="px-5 py-3">{p._count.leads}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {p.createdAt.toLocaleDateString("en-ZA")}
                    </td>
                    <td className="px-5 py-3">
                      <form action={changePlatformUserRole} className="flex items-center gap-2">
                        <input type="hidden" name="profileId" value={p.id} />
                        <select
                          name="userRole"
                          defaultValue={p.userRole ?? "DRIVER"}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-accent"
                        >
                          {platformRoles.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-ink/90"
                        >
                          Save
                        </button>
                      </form>
                    </td>
                    <td className="px-5 py-3">
                      <form action={suspendPlatformUser}>
                        <input type="hidden" name="profileId" value={p.id} />
                        <input type="hidden" name="action" value="suspend" />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          Suspend
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
