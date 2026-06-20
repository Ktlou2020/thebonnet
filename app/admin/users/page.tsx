import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; role?: string }>;
}) {
  await requireAdminUser("viewDashboard");
  const params = (await searchParams) ?? {};
  const q = (params.q ?? "").toLowerCase();
  const roleFilter = params.role ?? "ALL";
  const prisma = getPrisma();

  const profiles = prisma
    ? await prisma.profile.findMany({
        orderBy: { createdAt: "desc" },
        take: 300,
        include: { _count: { select: { vehicles: true, reviews: true, leads: true } }, xp: true },
      })
    : [];

  const filtered = profiles.filter((p) => {
    const roleMatch = roleFilter === "ALL" || p.userRole === roleFilter;
    const qMatch = !q || [p.fullName ?? "", p.email].join(" ").toLowerCase().includes(q);
    return roleMatch && qMatch;
  });

  const roles = ["ALL", "DRIVER", "WORKSHOP_OWNER", "ADMIN"];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ink px-6 py-8 text-white lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">User management</h1>
          <p className="mt-1 text-sm text-slate-300">All registered drivers and workshop owners on the platform.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <form method="get" className="mb-6 flex flex-wrap items-end gap-3 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
          <label className="flex-1 text-sm font-medium text-slate-700">Search
            <input name="q" defaultValue={params.q} placeholder="Name or email" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fire" />
          </label>
          <label className="text-sm font-medium text-slate-700">Role
            <select name="role" defaultValue={roleFilter} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fire">
              {roles.map((r) => <option key={r} value={r}>{r === "ALL" ? "All roles" : r}</option>)}
            </select>
          </label>
          <button type="submit" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">Apply</button>
          <Link href="/admin/users" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">Reset</Link>
        </form>

        <div className="mb-4 text-sm text-slate-500">{filtered.length} user{filtered.length === 1 ? "" : "s"}</div>

        <div className="overflow-auto rounded-[2rem] border border-slate-200 bg-white shadow-soft">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead><tr className="border-b border-slate-200 text-slate-500">
              <th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">XP</th><th className="px-4 py-3">Vehicles</th><th className="px-4 py-3">Reviews</th><th className="px-4 py-3">Joined</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">No users match.</td></tr>}
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="px-4 py-3"><div className="font-semibold text-slate-900">{p.fullName ?? "—"}</div><div className="text-xs">{p.email}</div></td>
                  <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">{p.userRole}</span></td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{p.xp?.totalXp ?? 0}</td>
                  <td className="px-4 py-3">{p._count.vehicles}</td>
                  <td className="px-4 py-3">{p._count.reviews}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{p.createdAt.toLocaleDateString("en-ZA")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
